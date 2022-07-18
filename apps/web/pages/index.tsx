import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export interface AnalyzeFormData {
  owner: string
  repository: string
}

export default function HomePage() {
  const { handleSubmit: onSubmit, register } = useForm<AnalyzeFormData>()
  const router = useRouter()

  async function handleSubmit(values: AnalyzeFormData) {
    router.push(`/${values.owner}/${values.repository}`)
  }

  return (
    <div className="grid max-w-5xl grid-flow-row gap-6 px-4 py-6 mx-auto">
      <Head>
        <title>Analyze GitHub Repository</title>
      </Head>

      <h1 className="text-3xl font-bold">Analyze Github Repository</h1>

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
    </div>
  )
}
