import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';
import { Button, Card, Input, Switch } from '../ui';
import { Question, QuestionType, MatchColumn } from '../../types';

interface QuestionEditorProps {
  questionType: QuestionType;
  initialQuestion?: Question;
  onSave: (question: Omit<Question, 'id'>) => void;
  onCancel: () => void;
}

const EditorContainer = styled(motion.div)`
  max-width: 600px;
  margin: 0 auto;
`;

const EditorCard = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const FormField = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-family: ${theme.typography.fontFamily.system};
  font-size: ${theme.typography.fontSize.base};
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  }
  
  &::placeholder {
    color: ${theme.colors.textTertiary};
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const OptionRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const OptionInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled(Button)`
  flex-shrink: 0;
`;

const AddOptionButton = styled(Button)`
  align-self: flex-start;
  margin-top: ${theme.spacing.sm};
`;

const CorrectAnswerSection = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surfaceSecondary};
  border-radius: ${theme.borderRadius.md};
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs};
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  
  &:hover {
    background: ${theme.colors.surface};
  }
`;

const RadioInput = styled.input`
  accent-color: ${theme.colors.primary};
`;

const MatchColumnsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
`;

const ColumnSection = styled.div``;

const ColumnTitle = styled.h4`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
`;

const MatchItem = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const MatchInput = styled(Input)`
  flex: 1;
`;

const MatchSelect = styled.select`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-family: ${theme.typography.fontFamily.system};
  
  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

const SettingsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surfaceSecondary};
  border-radius: ${theme.borderRadius.md};
`;

const SettingField = styled.div``;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.separator};
`;

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questionType,
  initialQuestion,
  onSave,
  onCancel,
}) => {
  const [questionText, setQuestionText] = useState(initialQuestion?.question || '');
  const [options, setOptions] = useState<string[]>(
    initialQuestion?.options || (questionType === 'multiple-choice' ? ['', '', '', ''] : [])
  );
  const [correctAnswer, setCorrectAnswer] = useState<string>(
    initialQuestion?.correctAnswer as string || ''
  );
  const [points, setPoints] = useState(initialQuestion?.points || 10);
  const [timeLimit, setTimeLimit] = useState(initialQuestion?.timeLimit || 30);
  
  // Match columns specific state
  const [leftColumn, setLeftColumn] = useState<string[]>(['', '', '']);
  const [rightColumn, setRightColumn] = useState<string[]>(['', '', '']);
  const [matches, setMatches] = useState<{ [key: string]: string }>({});

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // Reset correct answer if it was the removed option
    if (correctAnswer === options[index]) {
      setCorrectAnswer('');
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const updateLeftColumn = (index: number, value: string) => {
    const newLeft = [...leftColumn];
    newLeft[index] = value;
    setLeftColumn(newLeft);
  };

  const updateRightColumn = (index: number, value: string) => {
    const newRight = [...rightColumn];
    newRight[index] = value;
    setRightColumn(newRight);
  };

  const updateMatch = (leftItem: string, rightItem: string) => {
    setMatches({ ...matches, [leftItem]: rightItem });
  };

  const handleSave = () => {
    const baseQuestion = {
      type: questionType,
      question: questionText,
      points,
      timeLimit,
    };

    let finalQuestion: Omit<Question, 'id'>;

    switch (questionType) {
      case 'multiple-choice':
        finalQuestion = {
          ...baseQuestion,
          options: options.filter(opt => opt.trim()),
          correctAnswer,
        };
        break;
      
      case 'true-false':
        finalQuestion = {
          ...baseQuestion,
          correctAnswer,
        };
        break;
      
      case 'match-columns':
        finalQuestion = {
          ...baseQuestion,
          options: [...leftColumn.filter(item => item.trim()), ...rightColumn.filter(item => item.trim())],
          correctAnswer: JSON.stringify(matches),
        };
        break;
      
      case 'open-text':
        finalQuestion = {
          ...baseQuestion,
          correctAnswer: '', // Open text doesn't have a specific correct answer
        };
        break;
      
      case 'fill-in-blank':
        finalQuestion = {
          ...baseQuestion,
          correctAnswer,
        };
        break;
      
      default:
        return;
    }

    onSave(finalQuestion);
  };

  const isValid = () => {
    if (!questionText.trim()) return false;
    
    switch (questionType) {
      case 'multiple-choice':
        return options.filter(opt => opt.trim()).length >= 2 && correctAnswer;
      case 'true-false':
        return correctAnswer;
      case 'match-columns':
        return leftColumn.filter(item => item.trim()).length >= 2 && 
               rightColumn.filter(item => item.trim()).length >= 2;
      case 'open-text':
        return true;
      case 'fill-in-blank':
        return correctAnswer;
      default:
        return false;
    }
  };

  const renderQuestionSpecificFields = () => {
    switch (questionType) {
      case 'multiple-choice':
        return (
          <>
            <FormField>
              <Label>Answer Options</Label>
              <OptionsContainer>
                {options.map((option, index) => (
                  <OptionRow key={index}>
                    <OptionInput
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      fullWidth
                    />
                    {options.length > 2 && (
                      <RemoveButton
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M18 6L6 18M6 6l12 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        }
                      />
                    )}
                  </OptionRow>
                ))}
                {options.length < 6 && (
                  <AddOptionButton
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  >
                    Add Option
                  </AddOptionButton>
                )}
              </OptionsContainer>
            </FormField>

            <FormField>
              <CorrectAnswerSection>
                <Label>Correct Answer</Label>
                <RadioGroup>
                  {options.filter(opt => opt.trim()).map((option, index) => (
                    <RadioOption key={index}>
                      <RadioInput
                        type="radio"
                        name="correctAnswer"
                        value={option}
                        checked={correctAnswer === option}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                      />
                      {option || `Option ${String.fromCharCode(65 + index)}`}
                    </RadioOption>
                  ))}
                </RadioGroup>
              </CorrectAnswerSection>
            </FormField>
          </>
        );

      case 'true-false':
        return (
          <FormField>
            <CorrectAnswerSection>
              <Label>Correct Answer</Label>
              <RadioGroup>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="correctAnswer"
                    value="true"
                    checked={correctAnswer === 'true'}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                  />
                  True
                </RadioOption>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="correctAnswer"
                    value="false"
                    checked={correctAnswer === 'false'}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                  />
                  False
                </RadioOption>
              </RadioGroup>
            </CorrectAnswerSection>
          </FormField>
        );

      case 'match-columns':
        return (
          <FormField>
            <Label>Match Items</Label>
            <MatchColumnsContainer>
              <ColumnSection>
                <ColumnTitle>Left Column</ColumnTitle>
                {leftColumn.map((item, index) => (
                  <MatchItem key={index}>
                    <MatchInput
                      placeholder={`Item ${index + 1}`}
                      value={item}
                      onChange={(e) => updateLeftColumn(index, e.target.value)}
                      fullWidth
                    />
                  </MatchItem>
                ))}
              </ColumnSection>
              
              <ColumnSection>
                <ColumnTitle>Right Column</ColumnTitle>
                {rightColumn.map((item, index) => (
                  <MatchItem key={index}>
                    <MatchInput
                      placeholder={`Match ${index + 1}`}
                      value={item}
                      onChange={(e) => updateRightColumn(index, e.target.value)}
                      fullWidth
                    />
                    <MatchSelect
                      value={matches[leftColumn[index]] || ''}
                      onChange={(e) => updateMatch(leftColumn[index], e.target.value)}
                    >
                      <option value="">Select match</option>
                      {rightColumn.filter(r => r.trim()).map((rightItem, idx) => (
                        <option key={idx} value={rightItem}>{rightItem}</option>
                      ))}
                    </MatchSelect>
                  </MatchItem>
                ))}
              </ColumnSection>
            </MatchColumnsContainer>
          </FormField>
        );

      case 'fill-in-blank':
        return (
          <FormField>
            <Label>Correct Answer (for the blank)</Label>
            <Input
              placeholder="Enter the correct answer for the blank"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              fullWidth
            />
          </FormField>
        );

      case 'open-text':
        return (
          <FormField>
            <Label style={{ color: theme.colors.textSecondary }}>
              Open text questions will be graded manually
            </Label>
          </FormField>
        );

      default:
        return null;
    }
  };

  return (
    <EditorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <EditorCard variant="glass" padding="lg">
        <FormField>
          <Label>Question Text</Label>
          <TextArea
            placeholder="Enter your question here..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </FormField>

        {renderQuestionSpecificFields()}

        <FormField>
          <Label>Question Settings</Label>
          <SettingsSection>
            <SettingField>
              <Input
                label="Points"
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                fullWidth
              />
            </SettingField>
            <SettingField>
              <Input
                label="Time Limit (seconds)"
                type="number"
                min="10"
                max="300"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                fullWidth
              />
            </SettingField>
          </SettingsSection>
        </FormField>

        <Actions>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isValid()}
          >
            Save Question
          </Button>
        </Actions>
      </EditorCard>
    </EditorContainer>
  );
};