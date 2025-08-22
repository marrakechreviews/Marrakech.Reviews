import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Button } from './frontend/src/components/ui/button'
import { Input } from './frontend/src/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './frontend/src/components/ui/card'
import { Badge } from './frontend/src/components/ui/badge'
import { Textarea } from './frontend/src/components/ui/textarea'
import { Loader2, Plus, X, Download, Eye, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ArticleGeneratorPage = () => {
  const [urls, setUrls] = useState([''])
  const [isGenerating, setIsGenerating] = useState(false)
  const [taskId, setTaskId] = useState(null)
  const [articles, setArticles] = useState([])
  const [progress, setProgress] = useState('0%')
  const [status, setStatus] = useState('idle')
  const [copiedIndex, setCopiedIndex] = useState(null)

  const addUrlField = () => {
    setUrls([...urls, ''])
  }

  const removeUrlField = (index) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index))
    }
  }

  const updateUrl = (index, value) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const generateArticles = async () => {
    const validUrls = urls.filter((url) => url.trim() !== '')

    if (validUrls.length === 0) {
      toast.error('Please enter at least one valid URL')
      return
    }

    setIsGenerating(true)
    setArticles([])
    setProgress('0%')
    setStatus('pending')

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_urls: validUrls,
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        setTaskId(data.task_id)
        toast.success('Article generation started!')
        pollTaskStatus(data.task_id)
      } else {
        throw new Error(data.message || 'Failed to start article generation')
      }
    } catch (error) {
      console.error('Error generating articles:', error)
      toast.error('Failed to generate articles: ' + error.message)
      setIsGenerating(false)
    }
  }

  const pollTaskStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/article-status/${id}`)
      const data = await response.json()

      setStatus(data.status)
      setProgress(data.progress)
      setArticles(data.articles || [])

      if (data.status === 'completed') {
        setIsGenerating(false)
        toast.success('Articles generated successfully!')
      } else if (data.status === 'failed') {
        setIsGenerating(false)
        toast.error('Article generation failed')
      } else {
        // Continue polling
        setTimeout(() => pollTaskStatus(id), 2000)
      }
    } catch (error) {
      console.error('Error polling task status:', error)
      setIsGenerating(false)
      toast.error('Failed to check generation status')
    }
  }

  const copyToClipboard = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      toast.success('HTML copied to clipboard!')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadHtml = (content, url) => {
    const blob = new Blob([content], { type: 'text/html' })
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `article-${new URL(url).hostname}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(downloadUrl)
  }

  const previewArticle = (content) => {
    const newWindow = window.open('', '_blank')
    newWindow.document.write(content)
    newWindow.document.close()
  }

  return (
    <>
      <Helmet>
        <title>AI Article Generator - Create SEO-Optimized Content</title>
        <meta
          name='description'
          content='Generate SEO-optimized articles from any URL using AI. Create professional, ready-to-publish content automatically.'
        />
      </Helmet>

      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            AI Article Generator
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Transform any website into SEO-optimized, ready-to-publish articles.
            Simply enter the URLs and let AI create professional content for
            you.
          </p>
        </div>

        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Plus className='h-5 w-5' />
              Enter Website URLs
            </CardTitle>
            <CardDescription>
              Add the URLs of websites you want to convert into articles. Our AI
              will analyze the content and create SEO-optimized articles.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {urls.map((url, index) => (
              <div key={index} className='flex gap-2'>
                <Input
                  type='url'
                  placeholder='https://example.com/product-or-service'
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  className='flex-1'
                />
                {urls.length > 1 && (
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => removeUrlField(index)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            ))}

            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={addUrlField}
                className='flex items-center gap-2'
              >
                <Plus className='h-4 w-4' />
                Add Another URL
              </Button>

              <Button
                onClick={generateArticles}
                disabled={isGenerating}
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700'
              >
                {isGenerating ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
                {isGenerating ? 'Generating...' : 'Create Articles with AI'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isGenerating && (
          <Card className='mb-8'>
            <CardHeader>
              <CardTitle>Generation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Status: {status}</span>
                  <span>{progress}</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: progress }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {articles.length > 0 && (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Generated Articles
            </h2>

            {articles.map((article, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-lg'>{article.url}</CardTitle>
                      {article.scraped_data && (
                        <CardDescription className='mt-2'>
                          <strong>Title:</strong> {article.scraped_data.title}
                          <br />
                          <strong>Description:</strong>{' '}
                          {article.scraped_data.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      {article.html_content ? (
                        <Badge
                          variant='default'
                          className='bg-green-100 text-green-800'
                        >
                          Success
                        </Badge>
                      ) : (
                        <Badge variant='destructive'>Error</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {article.html_content ? (
                  <CardContent>
                    <div className='flex gap-2 mb-4'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => previewArticle(article.html_content)}
                        className='flex items-center gap-2'
                      >
                        <Eye className='h-4 w-4' />
                        Preview
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          downloadHtml(article.html_content, article.url)
                        }
                        className='flex items-center gap-2'
                      >
                        <Download className='h-4 w-4' />
                        Download HTML
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          copyToClipboard(article.html_content, index)
                        }
                        className='flex items-center gap-2'
                      >
                        {copiedIndex === index ? (
                          <Check className='h-4 w-4' />
                        ) : (
                          <Copy className='h-4 w-4' />
                        )}
                        {copiedIndex === index ? 'Copied!' : 'Copy HTML'}
                      </Button>
                    </div>

                    <Textarea
                      value={article.html_content}
                      readOnly
                      className='min-h-[200px] font-mono text-sm'
                      placeholder='Generated HTML will appear here...'
                    />
                  </CardContent>
                ) : (
                  <CardContent>
                    <div className='text-red-600'>
                      <strong>Error:</strong> {article.error}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        <Card className='mt-8'>
          <CardHeader>
            <CardTitle>Article Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-4 text-sm'>
              <div>
                <h4 className='font-semibold mb-2'>SEO Optimized</h4>
                <ul className='space-y-1 text-gray-600'>
                  <li>• Primary and secondary keywords</li>
                  <li>• Meta descriptions under 160 characters</li>
                  <li>• Proper H1-H3 heading hierarchy</li>
                  <li>• Local SEO elements</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2'>Content Structure</h4>
                <ul className='space-y-1 text-gray-600'>
                  <li>• Engaging titles and introductions</li>
                  <li>• 4-6 detailed sections</li>
                  <li>• Customer testimonials</li>
                  <li>• Clear call-to-actions</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2'>Professional Styling</h4>
                <ul className='space-y-1 text-gray-600'>
                  <li>• Clean, minimal design</li>
                  <li>• Mobile-responsive layout</li>
                  <li>• Proper typography</li>
                  <li>• Ready to publish</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2'>Business Focus</h4>
                <ul className='space-y-1 text-gray-600'>
                  <li>• Unique selling points</li>
                  <li>• Customer experience highlights</li>
                  <li>• Location advantages</li>
                  <li>• Competitive differentiators</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default ArticleGeneratorPage
