'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Download, Upload, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBuilder } from '@/contexts/BuilderContext'

interface Answer {
  question: string
  answer: string | string[]
  score: number
}

interface Evaluation {
  answers_in_order: boolean
  should_explain_scoring: boolean
  marking_scheme: {
    correct: number
    incorrect: number
    unmarked: number
  }
  answers: Answer[]
}

export default function EvaluationBuilder() {
  const router = useRouter()
  const { setSavedEvaluation } = useBuilder()
  const [evaluation, setEvaluation] = useState<Evaluation>({
    answers_in_order: true,
    should_explain_scoring: true,
    marking_scheme: {
      correct: 4,
      incorrect: -1,
      unmarked: 0
    },
    answers: []
  })

  const addAnswer = () => {
    const newAnswer: Answer = {
      question: `Q${evaluation.answers.length + 1}`,
      answer: 'A',
      score: evaluation.marking_scheme.correct
    }
    setEvaluation({
      ...evaluation,
      answers: [...evaluation.answers, newAnswer]
    })
  }

  const removeAnswer = (index: number) => {
    setEvaluation({
      ...evaluation,
      answers: evaluation.answers.filter((_, i) => i !== index)
    })
  }

  const updateAnswer = (index: number, updates: Partial<Answer>) => {
    const updatedAnswers = [...evaluation.answers]
    updatedAnswers[index] = { ...updatedAnswers[index], ...updates }
    setEvaluation({
      ...evaluation,
      answers: updatedAnswers
    })
  }

  const updateMarkingScheme = (key: keyof Evaluation['marking_scheme'], value: number) => {
    setEvaluation({
      ...evaluation,
      marking_scheme: { ...evaluation.marking_scheme, [key]: value }
    })
  }

  const generateAnswerKey = (count: number) => {
    const newAnswers: Answer[] = []
    for (let i = 0; i < count; i++) {
      newAnswers.push({
        question: `Q${i + 1}`,
        answer: 'A',
        score: evaluation.marking_scheme.correct
      })
    }
    setEvaluation({
      ...evaluation,
      answers: newAnswers
    })
  }

  const exportEvaluation = () => {
    const blob = new Blob([JSON.stringify(evaluation, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'evaluation.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveAndUse = () => {
    setSavedEvaluation(evaluation)
    router.push('/')
  }

  const importEvaluation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedEval = JSON.parse(e.target?.result as string)
        setEvaluation(importedEval)
      } catch (error) {
        alert('Invalid evaluation file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Answer Key Builder</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={saveAndUse}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                <span>Save & Use</span>
              </button>
              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importEvaluation}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportEvaluation}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export Answer Key</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Answers in Order
                    </label>
                    <p className="text-xs text-gray-600">
                      Questions follow sequence
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evaluation.answers_in_order}
                      onChange={(e) =>
                        setEvaluation({ ...evaluation, answers_in_order: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Explain Scoring
                    </label>
                    <p className="text-xs text-gray-600">
                      Show scoring details
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evaluation.should_explain_scoring}
                      onChange={(e) =>
                        setEvaluation({ ...evaluation, should_explain_scoring: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Marking Scheme */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Marking Scheme</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <input
                    type="number"
                    value={evaluation.marking_scheme.correct}
                    onChange={(e) => updateMarkingScheme('correct', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incorrect Answer
                  </label>
                  <input
                    type="number"
                    value={evaluation.marking_scheme.incorrect}
                    onChange={(e) => updateMarkingScheme('incorrect', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unmarked
                  </label>
                  <input
                    type="number"
                    value={evaluation.marking_scheme.unmarked}
                    onChange={(e) => updateMarkingScheme('unmarked', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            {/* Quick Generate */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Generate</h2>
              <p className="text-sm text-gray-600 mb-4">
                Generate answer key with specified number of questions
              </p>

              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Number of questions"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="200"
                  id="quick-generate-count"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('quick-generate-count') as HTMLInputElement
                    const count = parseInt(input.value)
                    if (count > 0) {
                      generateAnswerKey(count)
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Answer Key */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Answer Key ({evaluation.answers.length} questions)
                </h2>
                <button
                  onClick={addAnswer}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Answer</span>
                </button>
              </div>

              {evaluation.answers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    No answers yet. Add answers manually or use quick generate.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {evaluation.answers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 w-20">
                        <input
                          type="text"
                          value={answer.question}
                          onChange={(e) => updateAnswer(index, { question: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Q#"
                        />
                      </div>

                      <div className="flex-1">
                        <select
                          value={answer.answer as string}
                          onChange={(e) => updateAnswer(index, { answer: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </div>

                      <div className="flex-shrink-0 w-24">
                        <input
                          type="number"
                          value={answer.score}
                          onChange={(e) => updateAnswer(index, { score: parseFloat(e.target.value) })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          step="0.5"
                          placeholder="Score"
                        />
                      </div>

                      <button
                        onClick={() => removeAnswer(index)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
