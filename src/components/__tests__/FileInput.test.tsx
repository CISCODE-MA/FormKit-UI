/**
 * Tests for FileInput component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileInput, formatFileSize, getFileExtension, isImageFile } from '../FileInput';
import { required } from '../../validation/validators';

// Helper to create mock files
function createMockFile(name: string, size: number, type: string): File {
  const file = new File(['a'.repeat(size)], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

// Helper to create DataTransfer for drag events
function createDataTransfer(files: File[]): DataTransfer {
  const dataTransfer = {
    files: files,
    items: files.map((file) => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })),
    types: ['Files'],
  } as unknown as DataTransfer;
  return dataTransfer;
}

describe('FileInput', () => {
  describe('basic rendering', () => {
    it('renders with name', () => {
      render(<FileInput name="files" />);
      const input = document.querySelector('input[name="files"]');
      expect(input).toBeInTheDocument();
    });

    it('renders hidden file input', () => {
      render(<FileInput name="files" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveClass('sr-only');
    });

    it('renders drop zone', () => {
      render(<FileInput name="files" />);
      const dropzone = document.querySelector('.formkit-dropzone');
      expect(dropzone).toBeInTheDocument();
    });

    it('renders upload icon', () => {
      render(<FileInput name="files" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders default drop zone text', () => {
      render(<FileInput name="files" />);
      expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
    });

    it('renders browse text', () => {
      render(<FileInput name="files" />);
      expect(screen.getByText('browse')).toBeInTheDocument();
    });
  });

  describe('label and accessibility', () => {
    it('renders with label', () => {
      render(<FileInput name="files" label="Upload Files" />);
      const label = screen.getByText('Upload Files');
      expect(label).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<FileInput name="files" label="Files" required />);
      const required = screen.getAllByText('*');
      expect(required.length).toBeGreaterThan(0);
    });

    it('renders with hint text', () => {
      render(<FileInput name="files" hint="Max 5MB per file" />);
      const hint = screen.getByText('Max 5MB per file');
      expect(hint).toBeInTheDocument();
    });

    it('drop zone has button role', () => {
      render(<FileInput name="files" />);
      const dropzone = screen.getByRole('button', { name: /upload files/i });
      expect(dropzone).toBeInTheDocument();
    });

    it('drop zone is focusable', () => {
      render(<FileInput name="files" />);
      const dropzone = document.querySelector('.formkit-dropzone');
      expect(dropzone).toHaveAttribute('tabindex', '0');
    });
  });

  describe('file selection', () => {
    it('accepts single file by default', () => {
      render(<FileInput name="files" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).not.toHaveAttribute('multiple');
    });

    it('accepts multiple files when configured', () => {
      render(<FileInput name="files" multiple />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('multiple');
    });

    it('sets accept attribute', () => {
      render(<FileInput name="files" accept="image/*" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'image/*');
    });

    it('sets accept attribute from array', () => {
      render(<FileInput name="files" accept={['image/*', '.pdf']} />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'image/*,.pdf');
    });

    it('shows accepted file types', () => {
      render(<FileInput name="files" accept="image/*" />);
      expect(screen.getByText(/accepted: image\/\*/i)).toBeInTheDocument();
    });

    it('shows max size info', () => {
      render(<FileInput name="files" maxSize={5 * 1024 * 1024} />);
      expect(screen.getByText(/max size: 5 MB/i)).toBeInTheDocument();
    });
  });

  describe('file upload via input', () => {
    it('calls onChange when file is selected', async () => {
      const onChange = vi.fn();
      render(<FileInput name="files" onChange={onChange} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('test.txt', 1024, 'text/plain');
      await userEvent.upload(input, file);

      expect(onChange).toHaveBeenCalledWith([expect.any(File)]);
    });

    it('displays selected file in list', async () => {
      render(<FileInput name="files" />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('document.pdf', 2048, 'application/pdf');
      await userEvent.upload(input, file);

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('displays file size', async () => {
      render(<FileInput name="files" />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('test.txt', 1024, 'text/plain');
      await userEvent.upload(input, file);

      expect(screen.getByText('1 KB')).toBeInTheDocument();
    });

    it('handles multiple files', async () => {
      const onChange = vi.fn();
      render(<FileInput name="files" multiple onChange={onChange} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const files = [
        createMockFile('file1.txt', 1024, 'text/plain'),
        createMockFile('file2.txt', 2048, 'text/plain'),
      ];
      await userEvent.upload(input, files);

      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(File), expect.any(File)]),
      );
    });
  });

  describe('drag and drop', () => {
    it('highlights on drag enter', () => {
      render(<FileInput name="files" />);
      const dropzone = document.querySelector('.formkit-dropzone') as HTMLElement;

      fireEvent.dragEnter(dropzone);

      expect(dropzone).toHaveClass('border-blue-500');
      expect(dropzone).toHaveClass('bg-blue-50');
    });

    it('removes highlight on drag leave', () => {
      render(<FileInput name="files" />);
      const dropzone = document.querySelector('.formkit-dropzone') as HTMLElement;

      fireEvent.dragEnter(dropzone);
      fireEvent.dragLeave(dropzone);

      expect(dropzone).not.toHaveClass('border-blue-500');
    });

    it('accepts dropped files', () => {
      const onChange = vi.fn();
      render(<FileInput name="files" onChange={onChange} />);
      const dropzone = document.querySelector('.formkit-dropzone') as HTMLElement;

      const file = createMockFile('dropped.txt', 1024, 'text/plain');
      const dataTransfer = createDataTransfer([file]);

      fireEvent.drop(dropzone, { dataTransfer });

      expect(onChange).toHaveBeenCalled();
    });

    it('prevents default on drag over', () => {
      render(<FileInput name="files" />);
      const dropzone = document.querySelector('.formkit-dropzone') as HTMLElement;

      const event = new Event('dragover', { bubbles: true });
      event.preventDefault = vi.fn();

      dropzone.dispatchEvent(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('file removal', () => {
    it('shows remove button for each file', async () => {
      render(<FileInput name="files" />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('test.txt', 1024, 'text/plain');
      await userEvent.upload(input, file);

      const removeButton = screen.getByRole('button', { name: /remove test.txt/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('removes file on button click', async () => {
      const user = userEvent.setup();
      render(<FileInput name="files" />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('test.txt', 1024, 'text/plain');
      await userEvent.upload(input, file);

      expect(screen.getByText('test.txt')).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: /remove test.txt/i });
      await user.click(removeButton);

      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('calls onRemove when file is removed', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(<FileInput name="files" onRemove={onRemove} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('test.txt', 1024, 'text/plain');
      await userEvent.upload(input, file);

      const removeButton = screen.getByRole('button', { name: /remove test.txt/i });
      await user.click(removeButton);

      expect(onRemove).toHaveBeenCalledWith(expect.any(File));
    });
  });

  describe('validation', () => {
    it('validates max file size', async () => {
      const onError = vi.fn();
      render(<FileInput name="files" maxSize={1024} onError={onError} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('large.txt', 2048, 'text/plain');
      await userEvent.upload(input, file);

      expect(onError).toHaveBeenCalledWith(expect.stringContaining('exceeds maximum size'));
    });

    it('validates max files count', async () => {
      const onError = vi.fn();
      render(<FileInput name="files" multiple maxFiles={1} onError={onError} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const files = [
        createMockFile('file1.txt', 100, 'text/plain'),
        createMockFile('file2.txt', 100, 'text/plain'),
      ];
      await userEvent.upload(input, files);

      expect(onError).toHaveBeenCalledWith(expect.stringContaining('Maximum 1 file'));
    });

    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <FileInput
          name="files"
          label="Files"
          required
          validationRules={[{ validator: required() }]}
        />,
      );

      // Trigger validation by uploading and removing a file
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('test.txt', 1024, 'text/plain');
      await userEvent.upload(input, file);

      const removeButton = screen.getByRole('button', { name: /remove test.txt/i });
      await user.click(removeButton);

      // Should show error since no files
      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });
  });

  describe('file preview', () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    beforeAll(() => {
      URL.createObjectURL = vi.fn(() => 'blob:test-url');
      URL.revokeObjectURL = vi.fn();
    });

    afterAll(() => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('shows image preview for image files', async () => {
      render(<FileInput name="files" showPreview />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');
      await userEvent.upload(input, file);

      const img = document.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'blob:test-url');
    });

    it('shows document icon for non-image files', async () => {
      render(<FileInput name="files" showPreview />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('document.pdf', 1024, 'application/pdf');
      await userEvent.upload(input, file);

      // Should show document icon (svg), not img
      const img = document.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });

    it('can hide file list', async () => {
      render(<FileInput name="files" showFileList={false} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('test.txt', 1024, 'text/plain');
      await userEvent.upload(input, file);

      // File list should not show
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables file input', () => {
      render(<FileInput name="files" disabled />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toBeDisabled();
    });

    it('applies disabled styles to drop zone', () => {
      render(<FileInput name="files" disabled />);
      const dropzone = document.querySelector('.formkit-dropzone');
      expect(dropzone).toHaveClass('opacity-50');
      expect(dropzone).toHaveClass('cursor-not-allowed');
    });

    it('prevents drag and drop when disabled', () => {
      const onChange = vi.fn();
      render(<FileInput name="files" disabled onChange={onChange} />);
      const dropzone = document.querySelector('.formkit-dropzone') as HTMLElement;

      const file = createMockFile('test.txt', 1024, 'text/plain');
      const dataTransfer = createDataTransfer([file]);

      fireEvent.drop(dropzone, { dataTransfer });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('hides remove buttons when disabled', async () => {
      const { rerender } = render(<FileInput name="files" />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      const file = createMockFile('test.txt', 1024, 'text/plain');
      await userEvent.upload(input, file);

      expect(screen.getByRole('button', { name: /remove test.txt/i })).toBeInTheDocument();

      rerender(<FileInput name="files" disabled />);

      expect(screen.queryByRole('button', { name: /remove test.txt/i })).not.toBeInTheDocument();
    });
  });

  describe('custom text', () => {
    it('accepts custom drop zone text', () => {
      render(<FileInput name="files" dropZoneText="Drop your images here, or" />);
      expect(screen.getByText(/drop your images here/i)).toBeInTheDocument();
    });

    it('accepts custom browse text', () => {
      render(<FileInput name="files" browseText="select files" />);
      expect(screen.getByText('select files')).toBeInTheDocument();
    });
  });

  describe('keyboard interaction', () => {
    it('opens file dialog on Enter key', async () => {
      const user = userEvent.setup();
      render(<FileInput name="files" />);
      const dropzone = document.querySelector('.formkit-dropzone') as HTMLElement;

      // Mock click on input
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');

      dropzone.focus();
      await user.keyboard('{Enter}');

      expect(clickSpy).toHaveBeenCalled();
    });

    it('opens file dialog on Space key', async () => {
      const user = userEvent.setup();
      render(<FileInput name="files" />);
      const dropzone = document.querySelector('.formkit-dropzone') as HTMLElement;

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');

      dropzone.focus();
      await user.keyboard(' ');

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('handles decimal values', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('returns 0 B for zero', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
});

describe('getFileExtension', () => {
  it('extracts extension from filename', () => {
    expect(getFileExtension('document.pdf')).toBe('pdf');
  });

  it('handles multiple dots', () => {
    expect(getFileExtension('file.name.txt')).toBe('txt');
  });

  it('returns lowercase extension', () => {
    expect(getFileExtension('IMAGE.PNG')).toBe('png');
  });

  it('returns empty string for no extension', () => {
    expect(getFileExtension('filename')).toBe('');
  });
});

describe('isImageFile', () => {
  it('returns true for jpeg', () => {
    const file = createMockFile('photo.jpg', 100, 'image/jpeg');
    expect(isImageFile(file)).toBe(true);
  });

  it('returns true for png', () => {
    const file = createMockFile('image.png', 100, 'image/png');
    expect(isImageFile(file)).toBe(true);
  });

  it('returns true for gif', () => {
    const file = createMockFile('anim.gif', 100, 'image/gif');
    expect(isImageFile(file)).toBe(true);
  });

  it('returns false for pdf', () => {
    const file = createMockFile('doc.pdf', 100, 'application/pdf');
    expect(isImageFile(file)).toBe(false);
  });

  it('returns false for text file', () => {
    const file = createMockFile('text.txt', 100, 'text/plain');
    expect(isImageFile(file)).toBe(false);
  });
});
