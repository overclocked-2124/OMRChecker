'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Save, Download, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBuilder } from '@/contexts/BuilderContext'

interface BubbleField {
  fieldLabel: string
  fieldType: 'QTYPE_INT' | 'QTYPE_MCQ_5' | 'QTYPE_MCQ_4' | 'QTYPE_ROLL'
  bubbleValues: string[]
  origin: [number, number]
  bubblesGap: number
  labelsGap: number
}

interface FieldBlock {
  name: string
  origin: [number, number]
  dimensions: [number, number]
  bubbleDimensions: [number, number]
  fields: BubbleField[]
}

export default function TemplateBuilder() {
  const router = useRouter()
  const { setSavedTemplate } = useBuilder()
  const [templateName, setTemplateName] = useState('My Template')
  const [pageDimensions, setPageDimensions] = useState<[number, number]>([1200, 1700])
  const [fieldBlocks, setFieldBlocks] = useState<FieldBlock[]>([])
  const [activeBlock, setActiveBlock] = useState<number | null>(null)

  const addFieldBlock = () => {
    const newBlock: FieldBlock = {
      name: `Block ${fieldBlocks.length + 1}`,
      origin: [100, 100],
      dimensions: [100, 100],
      bubbleDimensions: [32, 32],
      fields: []
    }
    setFieldBlocks([...fieldBlocks, newBlock])
    setActiveBlock(fieldBlocks.length)
  }

  const removeFieldBlock = (index: number) => {
    setFieldBlocks(fieldBlocks.filter((_, i) => i !== index))
    if (activeBlock === index) setActiveBlock(null)
  }

  const addField = (blockIndex: number) => {
    const newField: BubbleField = {
      fieldLabel: `Q${fieldBlocks[blockIndex].fields.length + 1}`,
      fieldType: 'QTYPE_MCQ_4',
      bubbleValues: ['A', 'B', 'C', 'D'],
      origin: [0, 0],
      bubblesGap: 40,
      labelsGap: 60
    }
    const updatedBlocks = [...fieldBlocks]
    updatedBlocks[blockIndex].fields.push(newField)
    setFieldBlocks(updatedBlocks)
  }

  const removeField = (blockIndex: number, fieldIndex: number) => {
    const updatedBlocks = [...fieldBlocks]
    updatedBlocks[blockIndex].fields = updatedBlocks[blockIndex].fields.filter((_, i) => i !== fieldIndex)
    setFieldBlocks(updatedBlocks)
  }

  const updateBlock = (index: number, updates: Partial<FieldBlock>) => {
    const updatedBlocks = [...fieldBlocks]
    updatedBlocks[index] = { ...updatedBlocks[index], ...updates }
    setFieldBlocks(updatedBlocks)
  }

  const updateField = (blockIndex: number, fieldIndex: number, updates: Partial<BubbleField>) => {
    const updatedBlocks = [...fieldBlocks]
    updatedBlocks[blockIndex].fields[fieldIndex] = {
      ...updatedBlocks[blockIndex].fields[fieldIndex],
      ...updates
    }
    setFieldBlocks(updatedBlocks)
  }

  const exportTemplate = () => {
    const template = {
      pageDimensions,
      bubbleDimensions: fieldBlocks[0]?.bubbleDimensions || [32, 32],
      fieldBlocks: fieldBlocks.map(block => ({
        name: block.name,
        origin: block.origin,
        fieldType: 'QTYPE_MCQ',
        bubbleValues: ['A', 'B', 'C', 'D'],
        direction: 'vertical',
        labelsGap: 60,
        fields: block.fields
      }))
    }

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveAndUse = () => {
    const template = {
      pageDimensions,
      bubbleDimensions: fieldBlocks[0]?.bubbleDimensions || [32, 32],
      fieldBlocks: fieldBlocks.map(block => ({
        name: block.name,
        origin: block.origin,
        fieldType: 'QTYPE_MCQ',
        bubbleValues: ['A', 'B', 'C', 'D'],
        direction: 'vertical',
        labelsGap: 60,
        fields: block.fields
      }))
    }
    setSavedTemplate(template)
    router.push('/')
  }

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string)
        if (template.pageDimensions) setPageDimensions(template.pageDimensions)
        if (template.fieldBlocks) setFieldBlocks(template.fieldBlocks)
      } catch (error) {
        alert('Invalid template file')
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
              <h1 className="text-2xl font-bold text-gray-900">Template Builder</h1>
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
                  onChange={importTemplate}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export Template</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Width
                  </label>
                  <input
                    type="number"
                    value={pageDimensions[0]}
                    onChange={(e) => setPageDimensions([parseInt(e.target.value), pageDimensions[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Height
                  </label>
                  <input
                    type="number"
                    value={pageDimensions[1]}
                    onChange={(e) => setPageDimensions([pageDimensions[0], parseInt(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Field Blocks List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Field Blocks</h2>
                <button
                  onClick={addFieldBlock}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Block</span>
                </button>
              </div>

              <div className="space-y-2">
                {fieldBlocks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No field blocks yet. Add one to get started.
                  </p>
                ) : (
                  fieldBlocks.map((block, index) => (
                    <div
                      key={index}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        activeBlock === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveBlock(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{block.name}</p>
                          <p className="text-xs text-gray-500">
                            {block.fields.length} field{block.fields.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFieldBlock(index)
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Block Editor */}
          <div className="lg:col-span-2">
            {activeBlock !== null ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Block: {fieldBlocks[activeBlock].name}
                </h2>

                {/* Block Settings */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Block Name
                    </label>
                    <input
                      type="text"
                      value={fieldBlocks[activeBlock].name}
                      onChange={(e) => updateBlock(activeBlock, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origin X
                      </label>
                      <input
                        type="number"
                        value={fieldBlocks[activeBlock].origin[0]}
                        onChange={(e) =>
                          updateBlock(activeBlock, {
                            origin: [parseInt(e.target.value), fieldBlocks[activeBlock].origin[1]]
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origin Y
                      </label>
                      <input
                        type="number"
                        value={fieldBlocks[activeBlock].origin[1]}
                        onChange={(e) =>
                          updateBlock(activeBlock, {
                            origin: [fieldBlocks[activeBlock].origin[0], parseInt(e.target.value)]
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bubble Width
                      </label>
                      <input
                        type="number"
                        value={fieldBlocks[activeBlock].bubbleDimensions[0]}
                        onChange={(e) =>
                          updateBlock(activeBlock, {
                            bubbleDimensions: [parseInt(e.target.value), fieldBlocks[activeBlock].bubbleDimensions[1]]
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bubble Height
                      </label>
                      <input
                        type="number"
                        value={fieldBlocks[activeBlock].bubbleDimensions[1]}
                        onChange={(e) =>
                          updateBlock(activeBlock, {
                            bubbleDimensions: [fieldBlocks[activeBlock].bubbleDimensions[0], parseInt(e.target.value)]
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-semibold text-gray-900">Fields</h3>
                    <button
                      onClick={() => addField(activeBlock)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Field</span>
                    </button>
                  </div>

                  {fieldBlocks[activeBlock].fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{field.fieldLabel}</h4>
                        <button
                          onClick={() => removeField(activeBlock, fieldIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Field Label
                          </label>
                          <input
                            type="text"
                            value={field.fieldLabel}
                            onChange={(e) =>
                              updateField(activeBlock, fieldIndex, { fieldLabel: e.target.value })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Field Type
                          </label>
                          <select
                            value={field.fieldType}
                            onChange={(e) =>
                              updateField(activeBlock, fieldIndex, {
                                fieldType: e.target.value as any
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="QTYPE_MCQ_4">MCQ (4 options)</option>
                            <option value="QTYPE_MCQ_5">MCQ (5 options)</option>
                            <option value="QTYPE_INT">Integer</option>
                            <option value="QTYPE_ROLL">Roll Number</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Bubbles Gap
                          </label>
                          <input
                            type="number"
                            value={field.bubblesGap}
                            onChange={(e) =>
                              updateField(activeBlock, fieldIndex, {
                                bubblesGap: parseInt(e.target.value)
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Labels Gap
                          </label>
                          <input
                            type="number"
                            value={field.labelsGap}
                            onChange={(e) =>
                              updateField(activeBlock, fieldIndex, {
                                labelsGap: parseInt(e.target.value)
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {fieldBlocks[activeBlock].fields.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No fields yet. Add a field to get started.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Save className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Block Selected
                </h3>
                <p className="text-gray-600">
                  Add a field block from the left panel to start building your template.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
