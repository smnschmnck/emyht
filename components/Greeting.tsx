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
      <h4>First Name: {firstName}</h4>
      <h4>Last Name: {lastName}</h4>
    </div>
  );
};

export default Greeting;
