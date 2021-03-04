export type Result<L, A> = Failure<L, A> | Success<L, A>;

export class Failure<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isFailure(): this is Failure<L, A> {
    return true;
  }

  isSuccess(): this is Success<L, A> {
    return false;
  }

  applyOnSuccess<B>(_: (a: A) => B): Result<L, B> {
    return this as any;
  }
}

export class Success<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isFailure(): this is Failure<L, A> {
    return false;
  }

  isSuccess(): this is Success<L, A> {
    return true;
  }

  applyOnSuccess<B>(func: (a: A) => B): Result<L, B> {
    return new Success(func(this.value));
  }
}

export const failure = <L, A>(l: L): Result<L, A> => {
  return new Failure(l);
};

export const success = <L, A>(a: A): Result<L, A> => {
  return new Success<L, A>(a);
};
