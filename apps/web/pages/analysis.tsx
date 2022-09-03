import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import Heading from '../components/ui/Heading';
import Input from '../components/ui/Input';
import Layout from '../components/ui/Layout';

export interface AnalyzeFormData {
  owner: string;
  repository: string;
}

export default function HomePage() {
  const { handleSubmit: onSubmit, register } = useForm<AnalyzeFormData>();
  const router = useRouter();

  async function handleSubmit(values: AnalyzeFormData) {
    router.push(`/${values.owner}/${values.repository}`);
  }

  return (
    <Layout title="Analyze GitHub Repository">
      <Container>
        <Heading variant="h1">Analyze Github Repository</Heading>

        <form
          onSubmit={onSubmit(handleSubmit)}
          className="grid max-w-lg grid-flow-row gap-3"
        >
          <Input
            id="owner"
            label="Repository owner"
            helperText="e.g: A user or an organization on GitHub"
            required
            {...register('owner')}
          />

          <Input
            id="repository"
            label="Repository"
            required
            {...register('repository')}
          />

          <Button type="submit">Analyze</Button>
        </form>
      </Container>
    </Layout>
  );
}
