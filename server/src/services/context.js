/**
 * server/src/services/context.js
 *
 * Resolves customer context ("my flight", "my booking", etc.) from the logged-in session.
 * Evaluated strictly in routes/chat.js; research answer functions and evaluation scripts
 * never call this service directly.
 */

import { getCollection } from './db.js';

const CONTEXT_TRIGGER_REGEX = /\bmy (flight|booking|trip|ticket|journey)\b/i;

/**
 * Resolve a question using customer booking context.
 *
 * @param {Object|null} customer - req.user from session, or null
 * @param {string} question - Customer question text
 * @param {string} [bookingId] - Optional bookingId supplied in request body
 * @returns {Promise<{
 *   question: string,
 *   booking?: Object,
 *   needsClarification: boolean,
 *   options?: Array<{ bookingId: string, flightNo: string, route: string, date: string, airline: string }>
 * }>}
 */
export async function resolveQuestion(customer, question, bookingId) {
  // 1. If not a logged-in customer with a customerId, or question doesn't match trigger phrases
  if (
    !customer ||
    customer.role !== 'customer' ||
    !customer.customerId ||
    !CONTEXT_TRIGGER_REGEX.test(question)
  ) {
    return { question, needsClarification: false };
  }

  // 2. Load customer's bookings from MongoDB
  const bookingsCol = getCollection('bookings');
  const bookings = await bookingsCol
    .find({ customerId: customer.customerId })
    .sort({ date: -1, createdAt: -1 })
    .toArray();

  // If 0 bookings, question remains unchanged
  if (!bookings || bookings.length === 0) {
    return { question, needsClarification: false };
  }

  // 3. If bookingId was supplied
  if (bookingId) {
    const matching = bookings.find(b => b.bookingId === bookingId);
    if (!matching) {
      const err = new Error(`Booking ${bookingId} does not belong to customer`);
      err.status = 400;
      throw err;
    }

    const fare = matching.fareClass || '';
    const augmented = `${question} (Context: customer's booking ${matching.bookingId}, flight ${matching.flightNo}, ${matching.airline}, route ${matching.route}, ${fare}, travel date ${matching.date})`;
    return { question: augmented, booking: matching, needsClarification: false };
  }

  // 4. If no bookingId was supplied:
  // Exactly 1 booking
  if (bookings.length === 1) {
    const b = bookings[0];
    const fare = b.fareClass || '';
    const augmented = `${question} (Context: customer's booking ${b.bookingId}, flight ${b.flightNo}, ${b.airline}, route ${b.route}, ${fare}, travel date ${b.date})`;
    return { question: augmented, booking: b, needsClarification: false };
  }

  // 2 or more bookings -> needs clarification
  return {
    needsClarification: true,
    options: bookings.map(b => ({
      bookingId: b.bookingId,
      flightNo: b.flightNo,
      route: b.route,
      date: b.date,
      airline: b.airline
    }))
  };
}
