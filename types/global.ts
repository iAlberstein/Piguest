/**
 * Tipos globales y utilitarios base para Piguest.
 * Estos tipos son genéricos y reutilizables en toda la aplicación.
 * NO incluyen entidades de negocio específicas.
 */

// ============================================================================
// IDs Base
// ============================================================================

/** ID genérico para entidades del sistema */
export type ID = string;

/** UUID v4 format */
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

// ============================================================================
// Timestamps
// ============================================================================

/** Timestamp ISO 8601 */
export type Timestamp = string;

/** Campos de auditoría estándar para todas las entidades */
export interface Timestamps {
  created_at: Timestamp;
  updated_at: Timestamp;
}

/** Entidad con soft delete */
export interface SoftDelete extends Timestamps {
  deleted_at: Timestamp | null;
}

// ============================================================================
// Tipos Utilitarios
// ============================================================================

/** Objeto con ID obligatorio */
export type WithID<T> = T & { id: ID };

/** Objeto opcional con ID */
export type MaybeWithID<T> = T & { id?: ID };

/** Campos opcionales de un tipo */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Campos requeridos de un tipo parcial */
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Tipo para input de creación (sin ID ni timestamps) */
export type CreateInput<T> = Omit<T, "id" | "created_at" | "updated_at" | "deleted_at">;

/** Tipo para input de actualización (parcial, sin ID ni timestamps) */
export type UpdateInput<T> = Partial<Omit<T, "id" | "created_at" | "updated_at" | "deleted_at">>;

/** Función que retorna void */
export type VoidFn = () => void;

/** Función asíncrona genérica */
export type AsyncFn<T = void, R = unknown> = (arg: T) => Promise<R>;

/** Nullable genérico */
export type Nullable<T> = T | null;

/** Optional genérico */
export type Maybe<T> = T | undefined;

/** Array no vacío */
export type NonEmptyArray<T> = [T, ...T[]];

/** Record con keys específicas */
export type StrictRecord<K extends string | number | symbol, T> = Record<K, T>;

// ============================================================================
// Statuses Genéricos
// ============================================================================

/** Status básico activo/inactivo */
export type ActiveStatus = "active" | "inactive";

/** Status con estado pendiente */
export type PendingStatus = "pending" | "active" | "inactive";

/** Status con estado de archivo */
export type ArchiveStatus = "active" | "archived";

/** Status de visibilidad */
export type VisibilityStatus = "public" | "private" | "draft";

/** Status de proceso */
export type ProcessStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "cancelled";

/** Status de validación */
export type ValidationStatus = "valid" | "invalid" | "pending" | "unchecked";

/** Status de confirmación */
export type ConfirmationStatus = "confirmed" | "unconfirmed" | "pending";

// ============================================================================
// Paginación
// ============================================================================

/** Parámetros de paginación */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Metadata de paginación */
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Respuesta paginada genérica */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================================
// Resultados y Errores
// ============================================================================

/** Resultado exitoso */
export interface SuccessResult<T> {
  success: true;
  data: T;
}

/** Resultado con error */
export interface ErrorResult {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Resultado de operación (patrón Result/Either) */
export type Result<T> = SuccessResult<T> | ErrorResult;

/** Error de validación de campo */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/** Error de validación de formulario */
export interface ValidationError {
  success: false;
  errors: FieldError[];
}
