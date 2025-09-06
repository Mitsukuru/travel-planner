import { gql } from "@apollo/client";

export const INSERT_ACTIVITIES = gql`
  mutation InsertActivities(
    $itinerary_id: Int
    $name: String
    $location: String
    $notes: String
    $type: String
    $date: date
    $time: time
  ) {
    insert_activities(
      objects: {
        itinerary_id: $itinerary_id
        name: $name
        location: $location
        notes: $notes
        type: $type
        date: $date
        time: $time
      }
    ) {
      affected_rows
      returning {
        id
        itinerary_id
        name
        location
        notes
        type
        date
        time
      }
    }
  }
`;