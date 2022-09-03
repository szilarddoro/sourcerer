import { NhostClient } from '@nhost/nhost-js';

const nhostClient = new NhostClient({
  subdomain: 'ybmwhglwjenvssujfirr',
  region: 'eu-central-1',
  adminSecret: process.env.NHOST_ADMIN_SECRET,
});

export default nhostClient;
