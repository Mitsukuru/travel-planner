import { gql } from '@apollo/client';

export const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      id
      name
      startDate
      endDate
    }
  }
`;

