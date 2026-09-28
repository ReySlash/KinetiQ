import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '@/app/error';
import GlobalError from '@/app/global-error';

const captureException = vi.hoisted(() => vi.fn());

vi.mock('@sentry/nextjs', () => ({ captureException }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe('production error boundaries', () => {
  beforeEach(() => captureException.mockReset());

  it('captures a route error once and preserves retry behavior', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const error = new Error('route failed');

    render(<ErrorBoundary error={error} reset={reset} />);

    await waitFor(() => expect(captureException).toHaveBeenCalledOnce());
    expect(captureException).toHaveBeenCalledWith(error);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('captures a root error once while preserving the fallback document', async () => {
    const error = new Error('root failed');

    render(<GlobalError error={error} reset={vi.fn()} />);

    await waitFor(() => expect(captureException).toHaveBeenCalledOnce());
    expect(captureException).toHaveBeenCalledWith(error);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('keeps the route fallback usable when monitoring fails', async () => {
    captureException.mockImplementationOnce(() => {
      throw new Error('monitoring unavailable');
    });

    render(<ErrorBoundary error={new Error('route failed')} reset={vi.fn()} />);

    expect(
      await screen.findByRole('button', { name: 'Try again' }),
    ).toBeEnabled();
  });
});
