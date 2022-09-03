import { randomUUID } from 'crypto';
import { tmpdir } from 'os';

/**
 * Identifier of the analysis.
 */
export const ANALYSIS_ID = randomUUID().toUpperCase();

/**
 * Destination directory for the cloned repository.
 */
export const CLONE_DIRECTORY = `${tmpdir()}/sourcerer-${ANALYSIS_ID}`;
