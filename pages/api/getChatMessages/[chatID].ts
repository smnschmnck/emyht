import { NextApiRequest, NextApiResponse } from 'next';
import { BACKEND_HOST } from '../../../helpers/globals';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionID = req.cookies.SESSIONID;
  if (!sessionID) {
    return res.status(401).send('NOT AUTHORIZED');
  }

  const { chatID } = req.query;
  const response = await fetch(`${BACKEND_HOST}/chatMessages/${chatID}`, {
    headers: { authorization: `Bearer ${sessionID}` },
  });

  if (!response.ok) {
    const status = response.status;
    const msg = await response.text();
    return res.status(status).send(msg);
  }

  const json = await response.json();

  return res.json(json);
};

export default handler;
