export class PackingListError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PackingListError';
  }
}

export class PackingListNotFoundError extends PackingListError {
  constructor(id: string) {
    super(`Packing list with id ${id} not found`);
    this.name = 'PackingListNotFoundError';
  }
}

export class PackingListValidationError extends PackingListError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'PackingListValidationError';
  }
}

export class PackingListPermissionError extends PackingListError {
  constructor(message: string) {
    super(`Permission denied: ${message}`);
    this.name = 'PackingListPermissionError';
  }
} 