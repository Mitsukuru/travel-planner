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

export const GET_BUDGETS = gql`
  query GetBudgets($itinerary_id: Int!) {
    budgets(where: { itinerary_id: { _eq: $itinerary_id } }, order_by: { date: asc, created_at: desc }) {
      id
      itinerary_id
      date
      activity_id
      category
      amount
      description
      currency
      paid_by
      created_at
      activity {
        id
        name
        type
      }
    }
  }
`;

export const GET_BUDGETS_BY_DATE = gql`
  query GetBudgetsByDate($itinerary_id: Int!, $date: date!) {
    budgets(where: { itinerary_id: { _eq: $itinerary_id }, date: { _eq: $date } }) {
      id
      itinerary_id
      date
      activity_id
      category
      amount
      description
      currency
      paid_by
      created_at
      activity {
        id
        name
        type
      }
    }
  }
`;

export const GET_ACTIVITIES_BY_DATE = gql`
  query GetActivitiesByDate($itinerary_id: Int!, $date: date!) {
    activities(where: { itinerary_id: { _eq: $itinerary_id }, date: { _eq: $date } }) {
      id
      name
      type
      location
    }
  }
`;
