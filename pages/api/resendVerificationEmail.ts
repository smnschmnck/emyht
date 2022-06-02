import { NextApiRequest, NextApiResponse } from 'next';
import { BACKEND_HOST } from '../../helpers/globals';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionID = req.cookies.SESSIONID;
  if (!sessionID) {
    return res.status(401).send('NOT AUTHORIZED');
  }

  try {
    const response = await fetch(`${BACKEND_HOST}/resendVerificationEmail`, {
      headers: { authorization: `Bearer ${sessionID}` },
    });
    const status = response.status;
    const msg = await response.text();
    return res.status(status).send(msg);
  } catch (err) {
    return res.status(500).send('COULD NOT SEND EMAIL');
  }
};

export default handler;
