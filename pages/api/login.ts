import type { NextApiRequest, NextApiResponse } from 'next';
import { BACKEND_HOST } from '../../helpers/globals';

/** Not for reuse! Reuse only when you know what you are doing! */
const authProxy = async (
  endpoint: string,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const response = await fetch(BACKEND_HOST + endpoint, {
    method: 'post',
    body: req.body,
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const status = response.status;
    const msg = await response.text();
    return res.status(status).send(msg);
  }

  const json: { username: string; sessionID: string } = await response.json();
  const sessionID = json.sessionID;
  return res
    .setHeader('set-cookie', `SESSIONID=${sessionID}; path=/; httponly`)
    .json({ username: json.username });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return authProxy('/login', req, res);
};

export default handler;
