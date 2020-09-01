export class NetworkingListResponse {
  count: number; // Indicates the total count of items
  next: string; // Represents the next url to request
  previous: string; // Represents the previous url to request,
  results: any[];
}
