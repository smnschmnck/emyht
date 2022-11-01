import { NextApiRequest, NextApiResponse } from 'next';
import { postProxy } from '../../helpers/proxyWithAuth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return postProxy(req, res, '/leaveGroupChat');
};

export default handler;