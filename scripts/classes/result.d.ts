export declare type Result<L, A> = Failure<L, A> | Success<L, A>;
export declare class Failure<L, A> {
  readonly value: L;
  constructor(value: L);
  isFailure(): this is Failure<L, A>;
  isSuccess(): this is Success<L, A>;
  applyOnSuccess<B>(_: (a: A) => B): Result<L, B>;
}
export declare class Success<L, A> {
  readonly value: A;
  constructor(value: A);
  isFailure(): this is Failure<L, A>;
  isSuccess(): this is Success<L, A>;
  applyOnSuccess<B>(func: (a: A) => B): Result<L, B>;
}
export declare const failure: <L, A>(l: L) => Result<L, A>;
export declare const success: <L, A>(a: A) => Result<L, A>;
