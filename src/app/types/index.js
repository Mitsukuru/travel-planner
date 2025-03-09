/**
 * @typedef {Object} Place
 * @property {number} id
 * @property {string} time
 * @property {string} name
 * @property {string} note
 */

/**
 * @typedef {Object} Itinerary
 * @property {number} id
 * @property {string} title
 * @property {string} date
 * @property {Place[]} places
 */

/**
 * @typedef {Object} NewPlace
 * @property {string} time
 * @property {string} name
 * @property {string} note
 */

/**
 * @typedef {Object} EditingState
 * @property {('itinerary'|'place'|null)} type
 * @property {number|null} id
 * @property {string|null} field
 */

/**
 * @typedef {Object} DeleteDialogState
 * @property {boolean} isOpen
 * @property {number|null} itineraryId
 * @property {number|null} placeId
 */