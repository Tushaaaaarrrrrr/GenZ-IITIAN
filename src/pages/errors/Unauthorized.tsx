import ErrorPage from '../../components/ErrorPage';

export default function Unauthorized() {
  return <ErrorPage code={401} />;
}
