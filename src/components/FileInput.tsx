/**
 * FileInput component with drag-and-drop and preview
 */

import { forwardRef, useId, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ValidationRule } from '../validation/types';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * File preview data
 */
export interface FilePreview {
  /** File object */
  file: File;
  /** Preview URL (for images) */
  previewUrl?: string;
  /** Unique ID */
  id: string;
}

/**
 * Accepted file types
 */
export type AcceptedFileTypes =
  | 'image/*'
  | 'video/*'
  | 'audio/*'
  | 'application/pdf'
  | '.doc,.docx'
  | '.xls,.xlsx'
  | string;

/**
 * Props for FileInput component
 */
export interface FileInputProps {
  /** Input name attribute */
  name: string;
  /** Label text */
  label?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Custom CSS class name for the container */
  className?: string;
  /** Validation rules */
  validationRules?: ValidationRule[];
  /** Show error message */
  showError?: boolean;
  /** Auto-dismiss errors after delay (ms) */
  autoDismissError?: number;
  /** Hint or help text */
  hint?: string;
  /** Accepted file types */
  accept?: AcceptedFileTypes | AcceptedFileTypes[];
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Show file preview (for images) */
  showPreview?: boolean;
  /** Show file list */
  showFileList?: boolean;
  /** Custom drop zone text */
  dropZoneText?: string;
  /** Custom browse button text */
  browseText?: string;
  /** Change handler */
  onChange?: (files: File[]) => void;
  /** Error handler for file validation */
  onError?: (error: string) => void;
  /** File remove handler */
  onRemove?: (file: File) => void;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Upload cloud icon
 */
function UploadIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}

/**
 * X close icon
 */
function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/**
 * Document icon
 */
function DocumentIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

/**
 * File preview component
 */
interface PreviewItemProps {
  preview: FilePreview;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

function PreviewItem({ preview, onRemove, disabled }: PreviewItemProps) {
  const isImage = preview.previewUrl && isImageFile(preview.file);

  return (
    <div className="relative group border border-gray-200 rounded-lg p-2 flex items-center gap-2 bg-white">
      {isImage ? (
        <img
          src={preview.previewUrl}
          alt={preview.file.name}
          className="h-12 w-12 object-cover rounded"
        />
      ) : (
        <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
          <DocumentIcon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{preview.file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(preview.file.size)}</p>
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(preview.id)}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          aria-label={`Remove ${preview.file.name}`}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/**
 * FileInput component with drag-and-drop and preview
 */
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      name,
      label,
      required = false,
      disabled = false,
      className = '',
      validationRules = [],
      showError = true,
      autoDismissError,
      hint,
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      showPreview = true,
      showFileList = true,
      dropZoneText = 'Drag and drop files here, or',
      browseText = 'browse',
      onChange,
      onError,
      onRemove,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `file-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    // Internal ref
    const inputRef = useRef<HTMLInputElement>(null);

    // State
    const [files, setFiles] = useState<FilePreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isTouched, setIsTouched] = useState(false);

    // Accept string
    const acceptString = useMemo(() => {
      if (!accept) return undefined;
      return Array.isArray(accept) ? accept.join(',') : accept;
    }, [accept]);

    // Validation
    const { errors, validate } = useValidation({
      rules: validationRules,
    });

    // Error handling
    const { error, setErrors } = useFieldError({
      fieldName: name,
      autoDismiss: autoDismissError,
    });

    // Sync validation errors to field errors
    if (errors.length > 0 && error !== errors[0]) {
      setErrors(errors);
    } else if (errors.length === 0 && error !== null) {
      setErrors([]);
    }

    // Create preview URL for image files
    const createPreview = useCallback((file: File): FilePreview => {
      const preview: FilePreview = {
        file,
        id: generateId(),
      };

      if (isImageFile(file)) {
        preview.previewUrl = URL.createObjectURL(file);
      }

      return preview;
    }, []);

    // Clean up preview URLs on unmount
    useEffect(() => {
      return () => {
        files.forEach((preview) => {
          if (preview.previewUrl) {
            URL.revokeObjectURL(preview.previewUrl);
          }
        });
      };
    }, [files]);

    // Validate file
    const validateFile = useCallback(
      (file: File): string | null => {
        // Check file size
        if (maxSize && file.size > maxSize) {
          return `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`;
        }

        // Check file type
        if (accept) {
          const acceptList = Array.isArray(accept) ? accept : [accept];
          const isAccepted = acceptList.some((type) => {
            if (type.startsWith('.')) {
              // Extension check
              const extensions = type.split(',').map((e) => e.trim().slice(1).toLowerCase());
              return extensions.includes(getFileExtension(file.name));
            } else if (type.endsWith('/*')) {
              // MIME type wildcard (e.g., image/*)
              const mimePrefix = type.slice(0, -2);
              return file.type.startsWith(mimePrefix);
            } else {
              // Exact MIME type
              return file.type === type;
            }
          });

          if (!isAccepted) {
            return `File "${file.name}" is not an accepted file type`;
          }
        }

        return null;
      },
      [accept, maxSize],
    );

    // Add files
    const addFiles = useCallback(
      (newFiles: FileList | File[]) => {
        setIsTouched(true);
        const fileArray = Array.from(newFiles);
        const validFiles: FilePreview[] = [];
        const errors: string[] = [];

        // Check max files limit
        const currentCount = files.length;
        const totalCount = currentCount + fileArray.length;

        if (maxFiles && totalCount > maxFiles) {
          const errorMsg = `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`;
          errors.push(errorMsg);
          onError?.(errorMsg);
        }

        const maxToAdd = maxFiles ? Math.max(0, maxFiles - currentCount) : fileArray.length;
        const filesToProcess = fileArray.slice(0, maxToAdd);

        filesToProcess.forEach((file) => {
          const validationError = validateFile(file);
          if (validationError) {
            errors.push(validationError);
            onError?.(validationError);
          } else {
            validFiles.push(createPreview(file));
          }
        });

        if (validFiles.length > 0) {
          const newFilesList = multiple ? [...files, ...validFiles] : validFiles;
          setFiles(newFilesList);
          onChange?.(newFilesList.map((f) => f.file));
          validate(newFilesList.length > 0 ? 'has-files' : '');
        }

        if (errors.length > 0) {
          setErrors(errors);
        }
      },
      [
        files,
        maxFiles,
        multiple,
        validateFile,
        createPreview,
        onChange,
        validate,
        onError,
        setErrors,
      ],
    );

    // Remove file
    const removeFile = useCallback(
      (id: string) => {
        setFiles((prev) => {
          const toRemove = prev.find((f) => f.id === id);
          if (toRemove?.previewUrl) {
            URL.revokeObjectURL(toRemove.previewUrl);
          }
          if (toRemove) {
            onRemove?.(toRemove.file);
          }

          const newList = prev.filter((f) => f.id !== id);
          onChange?.(newList.map((f) => f.file));
          validate(newList.length > 0 ? 'has-files' : '');
          return newList;
        });
      },
      [onChange, onRemove, validate],
    );

    // Handle input change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          addFiles(e.target.files);
        }
        // Reset input value to allow selecting the same file again
        e.target.value = '';
      },
      [addFiles],
    );

    // Handle drag events
    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          setIsDragging(true);
        }
      },
      [disabled],
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          setIsDragging(true);
        }
      },
      [disabled],
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
          addFiles(droppedFiles);
        }
      },
      [disabled, addFiles],
    );

    // Handle browse click
    const handleBrowseClick = useCallback(() => {
      if (!disabled) {
        inputRef.current?.click();
      }
    }, [disabled]);

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;

    return (
      <div className={`formkit-file-container ${className} mb-4`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}

        {/* Hidden file input */}
        <input
          ref={(node) => {
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          id={fieldId}
          name={name}
          type="file"
          accept={acceptString}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          aria-describedby={
            [hasError ? errorId : undefined, showHint ? hintId : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />

        {/* Drop zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`formkit-dropzone border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : hasError
                ? 'border-red-300 hover:border-red-400'
                : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload files"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
        >
          <UploadIcon
            className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <p className="text-sm text-gray-600">
            {dropZoneText}{' '}
            <span className="text-blue-600 font-medium hover:text-blue-700">{browseText}</span>
          </p>
          {accept && (
            <p className="text-xs text-gray-500 mt-1">
              Accepted: {Array.isArray(accept) ? accept.join(', ') : accept}
            </p>
          )}
          {maxSize && (
            <p className="text-xs text-gray-500 mt-1">Max size: {formatFileSize(maxSize)}</p>
          )}
        </div>

        {/* File list / previews */}
        {showFileList && files.length > 0 && (
          <div
            className={`mt-3 space-y-2 ${showPreview ? 'formkit-file-previews' : 'formkit-file-list'}`}
          >
            {files.map((preview) => (
              <PreviewItem
                key={preview.id}
                preview={preview}
                onRemove={removeFile}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        {showHint && (
          <div id={hintId} className="text-xs text-gray-500 mt-1">
            {hint}
          </div>
        )}
        {showError && hasError && (
          <div id={errorId} className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';
