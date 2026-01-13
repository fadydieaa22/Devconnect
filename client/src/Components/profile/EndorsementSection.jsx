import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiPlus } from 'react-icons/fi';
import api from '../../api/axios';
import { Card, Button, Badge, Avatar, Modal, Input, TextArea } from '../ui';
import toast from 'react-hot-toast';

const EndorsementSection = ({ userId, currentUserId, userSkills }) => {
  const [endorsements, setEndorsements] = useState({ endorsements: [], grouped: {}, total: 0 });
  const [showEndorseModal, setShowEndorseModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [endorseMessage, setEndorseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEndorsements();
  }, [userId]);

  const loadEndorsements = async () => {
    try {
      const { data } = await api.get(`/endorsements/user/${userId}`);
      setEndorsements(data);
    } catch (error) {
      console.error('Failed to load endorsements:', error);
    }
  };

  const handleEndorse = async () => {
    if (!selectedSkill) {
      toast.error('Please select a skill to endorse');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/endorsements', {
        userId,
        skill: selectedSkill,
        message: endorseMessage,
      });
      
      toast.success('Endorsement sent!');
      setShowEndorseModal(false);
      setSelectedSkill('');
      setEndorseMessage('');
      loadEndorsements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to endorse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEndorse = currentUserId && currentUserId !== userId;
  const hasEndorsements = endorsements.total > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <FiAward className="text-[#10b981]" />
          Endorsements ({endorsements.total})
        </h3>
        {canEndorse && userSkills && userSkills.length > 0 && (
          <Button
            size="sm"
            leftIcon={<FiPlus />}
            onClick={() => setShowEndorseModal(true)}
          >
            Endorse
          </Button>
        )}
      </div>

      {!hasEndorsements ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🏆</p>
          <p className="text-secondary">No endorsements yet</p>
          {canEndorse && (
            <p className="text-sm text-muted mt-2">
              Be the first to endorse their skills!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(endorsements.grouped).map(([skill, skillEndorsements]) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-[var(--surface-hover)]"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <Badge variant="success">{skill}</Badge>
                  <span className="text-sm text-secondary">
                    {skillEndorsements.length} {skillEndorsements.length === 1 ? 'endorsement' : 'endorsements'}
                  </span>
                </h4>
              </div>

              <div className="space-y-3">
                {skillEndorsements.slice(0, 3).map((endorsement) => (
                  <div key={endorsement._id} className="flex items-start gap-3">
                    <Avatar user={endorsement.from} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">
                        {endorsement.from.name}
                      </p>
                      {endorsement.message && (
                        <p className="text-sm text-secondary mt-1">
                          "{endorsement.message}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {skillEndorsements.length > 3 && (
                  <p className="text-xs text-secondary mt-2">
                    +{skillEndorsements.length - 3} more
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Endorse Modal */}
      <Modal
        isOpen={showEndorseModal}
        onClose={() => setShowEndorseModal(false)}
        title="Endorse a Skill"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Select Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-primary focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            >
              <option value="">Choose a skill...</option>
              {userSkills?.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <TextArea
            label="Message (Optional)"
            placeholder="Add a personal message about this endorsement..."
            value={endorseMessage}
            onChange={(e) => setEndorseMessage(e.target.value)}
            rows={3}
            maxLength={500}
          />

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowEndorseModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndorse}
              isLoading={isSubmitting}
              disabled={!selectedSkill}
            >
              Send Endorsement
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default EndorsementSection;
