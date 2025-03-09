export const sortPlacesByTime = (places) => {
  return [...places].sort((a, b) => {
    const timeA = a.time.replace(':', '');
    const timeB = b.time.replace(':', '');
    return timeA.localeCompare(timeB);
  });
};