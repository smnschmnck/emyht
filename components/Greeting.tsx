interface GreetingProps {
  username: string;
  firstName: string;
  lastName: string;
}

const Greeting: React.FC<GreetingProps> = ({
  username,
  firstName,
  lastName,
}) => {
  return (
    <div>
      <h1>Hello {username}</h1>
      <h1>First Name: {firstName}</h1>
      <h1>Last Name: {lastName}</h1>
    </div>
  );
};

export default Greeting;
