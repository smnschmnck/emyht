import { NextApiRequest, NextApiResponse } from 'next';
import { BACKEND_HOST } from './globals';

export const postProxy = async (
  req: NextApiRequest,
  res: NextApiResponse,
  endpoint: string
) => {
  const sessionID = req.cookies.SESSIONID;
  if (!sessionID) {
    return res.status(401).send('NOT AUTHORIZED');
  }

  try {
    const response = await fetch(BACKEND_HOST + endpoint, {
      headers: {
        authorization: `Bearer ${sessionID}`,
        'Content-Type': 'application/json',
      },
      method: 'post',
      body: req.body,
    });
    const status = response.status;
    const payload = await response.text();
    return res.status(status).send(payload);
  } catch (err) {
    return res.status(500).send('INTERNAL ERROR');
  }
};

export const getProxy = async (
  req: NextApiRequest,
  res: NextApiResponse,
  endpoint: string
) => {
  const sessionID = req.cookies.SESSIONID;
  if (!sessionID) {
    return res.status(401).send('NOT AUTHORIZED');
  }

  try {
    const response = await fetch(BACKEND_HOST + endpoint, {
      headers: {
        authorization: `Bearer ${sessionID}`,
        'Content-Type': 'application/json',
      },
    });
    const status = response.status;
    const payload = await response.text();
    return res.status(status).send(payload);
  } catch (err) {
    return res.status(500).send('INTERNAL ERROR');
  }
};
