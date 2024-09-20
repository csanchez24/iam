import { z } from 'zod';

/**
 * Use when working with BigInt fields where we might send/receive
 * the value as an string | bigint. This ensures we always pipe the
 * result through the BigInt class before checking for nullish presence.
 * It will also parse and remove empty strings ''
 */
export const TransformStringToBigIntSchema = z
  .union([z.string(), z.bigint()])
  .transform((v) => (v === '' ? null : BigInt(v)))
  .nullish();

/**
 * Use when working with non required string fields where we might
 * want to allow nullish values or empty string. This will ensure that
 * in the case of '' or undefined we set the field to null.
 */
export const TransformFalsyStringToNullSchema = z
  .string()
  .nullish()
  .transform((v) => (v === '' || typeof v === 'undefined' ? null : v));
