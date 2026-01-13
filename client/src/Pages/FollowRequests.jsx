import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiX, FiUsers } from "react-icons/fi";
import api from "../api/axios";
import PageTransition from "../Components/ui/PageTransition";
import { Card, Button, Avatar } from "../Components/ui";
import { LoadingPage } from "../Components/ui/LoadingSpinner";
import EmptyState from "../Components/ui/EmptyState";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function FollowRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/user/follow-requests");
      setRequests(data);
    } catch (error) {
      console.error("Failed to load follow requests:", error);
      toast.error("Failed to load follow requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requesterId) => {
    try {
      setProcessingId(requesterId);
      await api.post(`/user/follow-request/${requesterId}/accept`);
      
      // Remove from list
      setRequests(requests.filter(r => r._id !== requesterId));
      toast.success("Follow request accepted");
    } catch (error) {
      console.error("Failed to accept request:", error);
      toast.error(error.response?.data?.message || "Failed to accept request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requesterId) => {
    try {
      setProcessingId(requesterId);
      await api.post(`/user/follow-request/${requesterId}/reject`);
      
      // Remove from list
      setRequests(requests.filter(r => r._id !== requesterId));
      toast.success("Follow request rejected");
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
              <FiUsers className="text-[#10b981]" />
              Follow Requests
            </h1>
            <p className="text-secondary">
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Requests List */}
          {requests.length === 0 ? (
            <EmptyState
              icon={<FiUsers size={64} />}
              title="No Follow Requests"
              description="You don't have any pending follow requests"
            />
          ) : (
            <div className="space-y-4">
              {requests.map((requester) => (
                <motion.div
                  key={requester._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card>
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <Link to={`/profile/${requester.username}`}>
                        <Avatar
                          src={requester.avatar}
                          alt={requester.name}
                          size="lg"
                        />
                      </Link>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${requester.username}`}
                          className="font-semibold text-primary hover:text-[#10b981] transition-colors"
                        >
                          {requester.name}
                        </Link>
                        <p className="text-sm text-secondary">
                          @{requester.username}
                        </p>
                        {requester.bio && (
                          <p className="text-sm text-secondary mt-1 line-clamp-2">
                            {requester.bio}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<FiCheck />}
                          onClick={() => handleAccept(requester._id)}
                          disabled={processingId === requester._id}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiX />}
                          onClick={() => handleReject(requester._id)}
                          disabled={processingId === requester._id}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
