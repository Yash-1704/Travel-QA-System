/**
 * server/src/routes/bookings.js
 *
 * Booking routes for Phase 3A:
 * POST /api/bookings
 * GET /api/bookings/mine
 * GET /api/bookings/:bookingId
 * GET /api/staff/bookings (mounted in index.js and/or handled here)
 */

import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollection, getNextBookingId } from '../services/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function getLocalDateString(dateInput, timeZone) {
  const d = new Date(dateInput);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/**
 * POST /api/bookings
 * Customer only.
 * Body: { flightId, fareClass, passengers }
 * Ignores any price or customerId sent in body.
 */
router.post('/', requireRole('customer'), async (req, res) => {
  try {
    const { flightId, fareClass, passengers } = req.body || {};

    const passCount = Number(passengers);
    if (!Number.isInteger(passCount) || passCount < 1 || passCount > 4) {
      return res.status(400).json({ error: 'Passengers must be an integer between 1 and 4' });
    }

    if (!flightId || !ObjectId.isValid(flightId)) {
      return res.status(400).json({ error: 'Valid flight ID is required' });
    }

    const flightsCol = getCollection('flights');
    const flight = await flightsCol.findOne({ _id: new ObjectId(flightId) });
    if (!flight) {
      return res.status(400).json({ error: 'Flight not found' });
    }

    if (new Date(flight.departureAt) <= new Date()) {
      return res.status(400).json({ error: 'Flight must depart in the future' });
    }

    const targetFare = flight.fares?.find(f => f.fareClass === fareClass);
    if (!targetFare) {
      return res.status(400).json({ error: 'Fare class does not exist on this flight' });
    }

    // Atomic conditional seat decrement
    const updateResult = await flightsCol.updateOne(
      {
        _id: new ObjectId(flightId),
        fares: {
          $elemMatch: {
            fareClass,
            seatsAvailable: { $gte: passCount }
          }
        }
      },
      {
        $inc: { 'fares.$.seatsAvailable': -passCount }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(409).json({ error: 'Not enough seats available' });
    }

    // Atomic booking ID
    const bookingId = await getNextBookingId();
    const date = getLocalDateString(flight.departureAt, flight.originTz);
    const totalPrice = targetFare.price * passCount;

    const newBooking = {
      bookingId,
      customerId: req.user.customerId,
      flightNo: flight.flightNo,
      route: flight.route,
      airline: flight.airline,
      fareClass,
      date,
      status: 'confirmed',
      passengers: passCount,
      totalPrice,
      source: 'website',
      createdAt: new Date().toISOString()
    };

    const bookingsCol = getCollection('bookings');
    try {
      await bookingsCol.insertOne(newBooking);
    } catch (insertErr) {
      // Revert seats if booking insert fails
      await flightsCol.updateOne(
        { _id: new ObjectId(flightId), 'fares.fareClass': fareClass },
        { $inc: { 'fares.$.seatsAvailable': passCount } }
      );
      console.error('Booking insert failed, reverted seats:', insertErr);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    return res.status(201).json({ booking: newBooking });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * GET /api/bookings/mine
 * Customer only: own bookings, newest first.
 */
router.get('/mine', requireRole('customer'), async (req, res) => {
  try {
    const bookingsCol = getCollection('bookings');
    const bookings = await bookingsCol
      .find({ customerId: req.user.customerId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ bookings });
  } catch (err) {
    console.error('Get my bookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/bookings/:bookingId
 * Owner or agent (403 otherwise, 404 missing).
 */
router.get('/:bookingId', requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingsCol = getCollection('bookings');
    const booking = await bookingsCol.findOne({ bookingId });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.user.role === 'agent' || booking.customerId === req.user.customerId) {
      return res.json({ booking });
    }

    return res.status(403).json({ error: 'Forbidden: Cannot access this booking' });
  } catch (err) {
    console.error('Get booking details error:', err);
    return res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

export default router;
