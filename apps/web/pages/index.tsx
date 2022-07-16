import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import Button from '../components/Button'
import Input from '../components/Input'

export interface AnalyzeFormData {
  owner: string
  repository: string
  basePath?: string
}

export default function HomePage() {
  const { handleSubmit: onSubmit, register } = useForm<AnalyzeFormData>()
  const router = useRouter()

  async function handleSubmit(values: AnalyzeFormData) {
    router.push(`/${values.owner}/${values.repository}`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-flow-row gap-6">
      <Head>
        <title>Analyze GitHub Repository</title>
      </Head>

      <h1 className="font-bold text-3xl text-slate-900">
        Analyze Github Repository
      </h1>

      <form
        onSubmit={onSubmit(handleSubmit)}
        className="grid grid-flow-row max-w-lg gap-3"
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

        <Input
          id="basePath"
          label="Base path"
          placeholder="/packages/package-name"
          {...register('basePath')}
        />

        <Button type="submit">Analyze</Button>
      </form>
    </div>
  )
}
