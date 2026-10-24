/**
 * server/src/routes/flights.js
 *
 * Public flight search and details endpoints for Phase 3A:
 * GET /api/flights?from=&to=&date=&passengers=&sort=
 * GET /api/flights/:id
 */

import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../services/db.js';

const router = express.Router();

function formatLocal(dateInput, timeZone) {
  const d = new Date(dateInput);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d).replace(',', '');
  } catch {
    return d.toISOString();
  }
}

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

function formatFlight(flight) {
  const dep = new Date(flight.departureAt);
  const arr = new Date(flight.arrivalAt);
  const durationMinutes = Math.round((arr.getTime() - dep.getTime()) / 60000);

  return {
    id: flight._id.toString(),
    _id: flight._id.toString(),
    flightNo: flight.flightNo,
    airline: flight.airline,
    origin: flight.origin,
    destination: flight.destination,
    route: flight.route,
    originTz: flight.originTz,
    destinationTz: flight.destinationTz,
    departureAt: dep.toISOString(),
    arrivalAt: arr.toISOString(),
    departureLocal: formatLocal(dep, flight.originTz),
    arrivalLocal: formatLocal(arr, flight.destinationTz),
    durationMinutes,
    aircraft: flight.aircraft,
    fares: flight.fares
  };
}

/**
 * GET /api/flights
 * Query params: from, to, date, passengers, sort
 */
router.get('/', async (req, res) => {
  try {
    const { from, to, date, sort } = req.query;
    const passengers = Math.max(1, parseInt(req.query.passengers, 10) || 1);

    const now = new Date();
    const query = {
      departureAt: { $gt: now },
      fares: {
        $elemMatch: {
          seatsAvailable: { $gte: passengers }
        }
      }
    };

    if (from && typeof from === 'string' && from.trim() !== '') {
      query.origin = from.trim().toUpperCase();
    }

    if (to && typeof to === 'string' && to.trim() !== '') {
      query.destination = to.trim().toUpperCase();
    }

    const flightsCol = getCollection('flights');
    let flights = await flightsCol.find(query).toArray();

    // Filter by date (YYYY-MM-DD in origin airport's local time) if requested
    if (date && typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      const targetDate = date.trim();
      flights = flights.filter(f => getLocalDateString(f.departureAt, f.originTz) === targetDate);
    }

    // Format flight objects
    let formatted = flights.map(formatFlight);

    // Sort: price (cheapest fare with seats >= passengers) or departure (default)
    if (sort === 'price') {
      formatted.sort((a, b) => {
        const minFareA = Math.min(
          ...a.fares.filter(f => f.seatsAvailable >= passengers).map(f => f.price)
        );
        const minFareB = Math.min(
          ...b.fares.filter(f => f.seatsAvailable >= passengers).map(f => f.price)
        );
        return minFareA - minFareB;
      });
    } else {
      // Default: departure time ascending
      formatted.sort((a, b) => new Date(a.departureAt) - new Date(b.departureAt));
    }

    return res.json({ flights: formatted });
  } catch (err) {
    console.error('Flights search error:', err);
    return res.status(500).json({ error: 'Failed to search flights' });
  }
});

/**
 * GET /api/flights/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid flight ID' });
    }

    const flightsCol = getCollection('flights');
    const flight = await flightsCol.findOne({ _id: new ObjectId(id) });
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    return res.json({ flight: formatFlight(flight) });
  } catch (err) {
    console.error('Get flight error:', err);
    return res.status(500).json({ error: 'Failed to get flight' });
  }
});

export default router;
