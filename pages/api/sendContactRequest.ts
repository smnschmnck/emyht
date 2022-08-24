import { NextApiRequest, NextApiResponse } from 'next';
import { postProxyWithAuth } from '../../helpers/proxy';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return postProxyWithAuth(req, res, '/contactRequest');
};

export default handler;
