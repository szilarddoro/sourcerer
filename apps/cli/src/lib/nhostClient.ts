import { NhostClient } from '@nhost/nhost-js';

const nhostClient = new NhostClient({
  subdomain: process.env.NHOST_SUBDOMAIN,
  region: process.env.NHOST_REGION,
  adminSecret: process.env.NHOST_ADMIN_SECRET,
});

export default nhostClient;
