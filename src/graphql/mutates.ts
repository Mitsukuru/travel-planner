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

export const INSERT_BUDGET = gql`
  mutation InsertBudget(
    $itinerary_id: Int!
    $date: date!
    $activity_id: Int
    $category: String!
    $amount: numeric!
    $description: String
    $currency: String
    $paid_by: String
  ) {
    insert_budgets(
      objects: {
        itinerary_id: $itinerary_id
        date: $date
        activity_id: $activity_id
        category: $category
        amount: $amount
        description: $description
        currency: $currency
        paid_by: $paid_by
      }
    ) {
      affected_rows
      returning {
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
      }
    }
  }
`;

export const UPDATE_BUDGET = gql`
  mutation UpdateBudget(
    $id: Int!
    $activity_id: Int
    $category: String!
    $amount: numeric!
    $description: String
  ) {
    update_budgets_by_pk(
      pk_columns: { id: $id }
      _set: {
        activity_id: $activity_id
        category: $category
        amount: $amount
        description: $description
      }
    ) {
      id
      itinerary_id
      date
      activity_id
      category
      amount
      description
      currency
      created_at
    }
  }
`;

export const DELETE_BUDGET = gql`
  mutation DeleteBudget($id: Int!) {
    delete_budgets_by_pk(id: $id) {
      id
    }
  }
`;