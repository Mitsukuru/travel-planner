import { gql } from "@apollo/client";

export const GET_GROUP = gql`
  query group_by_pk($id: uuid!) {
    group_by_pk(id: $id) {
      created_at
      id
      name
      updated_at
    }
  }
`;

export const GET_ITINERARIES = gql`
  query itineraries {
    itineraries {
      created_by
      destination
      end_date
      group_id
      id
      location_type
      start_date
      title
      travel_purpose
      updated_at
    }
  }
`;

export const GET_ACTIVITIES = gql`
query activities {
  activities {
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
`;
