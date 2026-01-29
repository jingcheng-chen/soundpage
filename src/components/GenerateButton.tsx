import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useDocumentStore } from '@/stores/documentStore'
import { useEngineStore } from '@/stores/engineStore'
import { useGeneration } from '@/hooks/useGeneration'

interface GenerateButtonProps {
  className?: string
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ className }) => {
  const { text } = useDocumentStore()
  const { isReady } = useEngineStore()
  const { isGenerating, generate } = useGeneration()

  const isDisabled = !text.trim() || !isReady || isGenerating

  return (
    <motion.div
      className={className}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
    >
      <Button
        onClick={generate}
        disabled={isDisabled}
        isLoading={isGenerating}
        size="lg"
        className={cn(
          'w-full h-14',
          'text-base font-semibold',
          !isDisabled && 'glow'
        )}
      >
        {!isGenerating && <Mic className="w-5 h-5 mr-2" />}
        {isGenerating ? 'Generating...' : 'Generate Audio'}
      </Button>
    </motion.div>
  )
}
