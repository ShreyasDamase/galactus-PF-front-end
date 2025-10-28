// components/CommentsSheet.tsx
"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme, Button, Text, Icon, IconButton, Column, Row, Input } from '@once-ui-system/core';
import { useComments, useCreateComment, useLikeComment, useUnlikeComment } from '@/lib/hooks/useComments';
import { Comment } from '@/lib/types/comment.types';

interface CommentsSheetProps {
  show: boolean;
  onClose: () => void;
  blogId: string;
}

export default function CommentsSheet({ show, onClose, blogId }: CommentsSheetProps) {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showNameEmailFields, setShowNameEmailFields] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const isDark = theme.resolvedTheme === 'dark';

  // Fetch comments
  const { data: commentsData, isLoading, error } = useComments(blogId);
  const comments = commentsData?.comments || [];
  const totalComments = commentsData?.total || 0;

  // Mutations
  const createCommentMutation = useCreateComment(blogId);
  const likeCommentMutation = useLikeComment(blogId);
  const unlikeCommentMutation = useUnlikeComment(blogId);

  // Load guest info from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("guestName");
    const savedEmail = localStorage.getItem("guestEmail");
    const savedLikedComments = localStorage.getItem("likedComments");
    
    if (savedName && savedEmail) {
      setGuestName(savedName);
      setGuestEmail(savedEmail);
      setShowNameEmailFields(false);
    } else {
      setShowNameEmailFields(true);
    }

    if (savedLikedComments) {
      setLikedComments(new Set(JSON.parse(savedLikedComments)));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      alert("Please enter a comment");
      return;
    }
    
    if (showNameEmailFields && (!guestName.trim() || !guestEmail.trim())) {
      alert("Please provide your name and email");
      return;
    }

    if (commentContent.length > 2000) {
      alert("Comment cannot exceed 2000 characters");
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        content: commentContent.trim(),
        parentId: replyingTo
      });

      // Save guest info
      localStorage.setItem("guestName", guestName);
      localStorage.setItem("guestEmail", guestEmail);

      // Reset form
      setCommentContent("");
      setReplyingTo(null);
      setShowNameEmailFields(false);
      
      alert("Comment submitted! It will appear after moderation.");
    } catch (error: any) {
      alert(error?.message || "Failed to submit comment. Please try again.");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const isLiked = likedComments.has(commentId);
    
    try {
      if (isLiked) {
        await unlikeCommentMutation.mutateAsync(commentId);
        const newLiked = new Set(likedComments);
        newLiked.delete(commentId);
        setLikedComments(newLiked);
        localStorage.setItem("likedComments", JSON.stringify([...newLiked]));
      } else {
        await likeCommentMutation.mutateAsync(commentId);
        const newLiked = new Set(likedComments);
        newLiked.add(commentId);
        setLikedComments(newLiked);
        localStorage.setItem("likedComments", JSON.stringify([...newLiked]));
      }
    } catch (error) {
      console.error("Failed to like/unlike comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const sheetVariants: Variants = {
    hidden: isMobile ? { y: "100%" } : { x: "100%" },
    visible: {
      y: 0,
      x: 0,
      transition: { type: "spring", stiffness: 400, damping: 40 }
    },
    exit: isMobile ? { y: "100%" } : { x: "100%" }
  };

  const renderComment = (comment: Comment) => (
    <Column key={comment._id} fillWidth gap="m">
      {/* Main Comment */}
      <Column
        fillWidth
        padding="m"
        background="neutral-alpha-weak"
        radius="l"
        gap="m"
      >
        <Row fillWidth gap="12" vertical="start">
          {/* Avatar */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${
                isDark 
                  ? 'rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8)' 
                  : 'rgba(59, 130, 246, 1), rgba(147, 51, 234, 1)'
              })`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '16px',
              flexShrink: 0
            }}
          >
            {comment.guestName.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <Column fillWidth gap="8">
            <Row gap="8" wrap vertical="center">
              <Text variant="body-strong-m">{comment.guestName}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {formatDate(comment.createdAt)}
              </Text>
              {comment.isEdited && (
                <Text 
                  variant="body-default-xs" 
                  onBackground="neutral-weak"
                  style={{ fontStyle: 'italic' }}
                >
                  (edited)
                </Text>
              )}
            </Row>
            <Text variant="body-default-m" style={{ whiteSpace: 'pre-wrap' }}>
              {comment.content}
            </Text>
            <Row gap="16">
              <Button
                variant="tertiary"
                size="s"
                prefixIcon="thumbUp"
                label={comment.likes.toString()}
                onClick={() => handleLikeComment(comment._id)}
                style={{
                  color: likedComments.has(comment._id) ? '#3b82f6' : undefined
                }}
              />
              <Button
                variant="tertiary"
                size="s"
                prefixIcon="reply"
                label="Reply"
                onClick={() => setReplyingTo(comment._id)}
              />
            </Row>
          </Column>
        </Row>
      </Column>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Column fillWidth paddingLeft="xl" gap="m">
          {comment.replies.map((reply) => (
            <Column
              key={reply._id}
              fillWidth
              padding="s"
              background="surface"
              border="neutral-alpha-weak"
              radius="m"
              gap="8"
            >
              <Row fillWidth gap="8" vertical="start">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${
                      isDark 
                        ? 'rgba(16, 185, 129, 0.8), rgba(6, 182, 212, 0.8)' 
                        : 'rgba(16, 185, 129, 1), rgba(6, 182, 212, 1)'
                    })`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px',
                    flexShrink: 0
                  }}
                >
                  {reply.guestName.charAt(0).toUpperCase()}
                </div>
                <Column fillWidth gap="4">
                  <Row gap="8" vertical="center">
                    <Text variant="body-strong-s">{reply.guestName}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {formatDate(reply.createdAt)}
                    </Text>
                  </Row>
                  <Text variant="body-default-s">{reply.content}</Text>
                  <Button
                    variant="tertiary"
                    size="s"
                    prefixIcon="thumbUp"
                    label={reply.likes.toString()}
                    onClick={() => handleLikeComment(reply._id)}
                    style={{
                      color: likedComments.has(reply._id) ? '#3b82f6' : undefined
                    }}
                  />
                </Column>
              </Row>
            </Column>
          ))}
        </Column>
      )}

      {/* Reply Form */}
      {replyingTo === comment._id && (
        <Column
          fillWidth
          paddingLeft="xl"
          padding="m"
          background="brand-alpha-weak"
          border="brand-alpha-medium"
          radius="m"
          gap="m"
        >
          <Row gap="8" vertical="center">
            <Icon name="reply" onBackground="brand-weak" size="s" />
            <Text variant="body-default-s" onBackground="brand-weak">
              Replying to {comment.guestName}
            </Text>
          </Row>
          <form onSubmit={handleSubmitComment}>
            <Column fillWidth gap="m">
              {showNameEmailFields && (
                <Row fillWidth gap="8" s={{ direction: "column" }}>
                  <Input
                    id="reply-name"
                    type="text"
                    placeholder="Your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                  <Input
                    id="reply-email"
                    type="email"
                    placeholder="Your email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </Row>
              )}
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write your reply..."
                maxLength={2000}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'white',
                  color: isDark ? 'white' : 'black',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
              <Row gap="8" horizontal="between">
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {commentContent.length}/2000
                </Text>
                <Row gap="8">
                  <Button
                    type="submit"
                    variant="primary"
                    size="s"
                    label={createCommentMutation.isPending ? "Submitting..." : "Submit Reply"}
                    disabled={createCommentMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="s"
                    label="Cancel"
                    onClick={() => {
                      setReplyingTo(null);
                      setCommentContent("");
                    }}
                  />
                </Row>
              </Row>
            </Column>
          </form>
        </Column>
      )}
    </Column>
  );

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)'
            }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={`fixed z-50 ${
              isMobile
                ? "bottom-0 left-0 right-0"
                : "top-0 right-0 bottom-0 w-[480px]"
            }`}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              height: isMobile ? "90vh" : "100vh",
              maxHeight: isMobile ? "90vh" : "100vh"
            }}
          >
            <Column
              fillWidth
              fillHeight
              background="surface"
              border={isMobile ? undefined : "neutral-alpha-weak"}
              borderStyle={isMobile ? undefined : "solid"}
              radius={isMobile ? "xl-8" : undefined}
              style={{ 
                boxShadow: isMobile 
                  ? '0 -4px 20px rgba(0, 0, 0, 0.1)' 
                  : '0 0 40px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden'
              }}
            >
              {/* Mobile drag indicator */}
              {isMobile && (
                <Row fillWidth horizontal="center" paddingTop="8" paddingBottom="4">
                  <div 
                    style={{
                      width: '40px',
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </Row>
              )}

              {/* Header */}
              <Row
                fillWidth
                paddingX="l"
                paddingY="m"
                horizontal="between"
                vertical="center"
                border="neutral-alpha-weak"
                style={{
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
                }}
              >
                <Row gap="12" vertical="center">
                  <Icon name="chat" onBackground="neutral-weak" size="l" />
                  <Column gap="4">
                    <Text variant="heading-strong-m">Comments</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
                    </Text>
                  </Column>
                </Row>
                <IconButton
                  icon="close"
                  tooltip="Close"
                  tooltipPosition="bottom"
                  variant="tertiary"
                  size="m"
                  onClick={onClose}
                />
              </Row>

              {/* Comments List */}
              <Column
                fillWidth
                flex={1}
                overflowY="auto"
                paddingX="l"
                paddingY="m"
                gap="l"
                style={{
                  scrollBehavior: 'smooth'
                }}
              >
                {isLoading ? (
                  <Column fillWidth horizontal="center" paddingY="xl">
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}
                    />
                  </Column>
                ) : error ? (
                  <Column fillWidth horizontal="center" vertical="center" paddingY="xl" gap="m">
                    <Icon name="alertCircle" onBackground="danger-weak" size="xl" />
                    <Column gap="4" horizontal="center">
                      <Text variant="heading-default-m" onBackground="danger-weak">
                        Failed to load comments
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Please try again later
                      </Text>
                    </Column>
                  </Column>
                ) : comments.length === 0 ? (
                  <Column fillWidth horizontal="center" vertical="center" paddingY="xl" gap="m">
                    <Icon name="chat" onBackground="neutral-weak" size="xl" />
                    <Column gap="4" horizontal="center">
                      <Text variant="heading-default-m" onBackground="neutral-weak">
                        No comments yet
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Be the first to share your thoughts!
                      </Text>
                    </Column>
                  </Column>
                ) : (
                  comments.map((comment) => renderComment(comment))
                )}
              </Column>

              {/* Comment Input - Fixed at bottom */}
              {!replyingTo && (
                <Column
                  fillWidth
                  padding="l"
                  background="surface"
                  border="neutral-alpha-weak"
                  borderStyle="solid"
                  gap="m"
                  style={{
                    boxShadow: isMobile ? '0 -4px 12px rgba(0, 0, 0, 0.05)' : undefined
                  }}
                >
                  <form onSubmit={handleSubmitComment}>
                    <Column fillWidth gap="m">
                      {showNameEmailFields && (
                        <Column
                          fillWidth
                          padding="s"
                          background="warning-alpha-weak"
                          border="warning-alpha-medium"
                          radius="m"
                          gap="8"
                        >
                          <Row gap="8" vertical="center">
                            <Icon name="infoCircle" onBackground="warning-weak" size="s" />
                            <Text variant="body-default-xs" onBackground="warning-weak">
                              Enter your details to comment
                            </Text>
                          </Row>
                          <Row fillWidth gap="8" s={{ direction: "column" }}>
                            <Input
                              id="guest-name"
                              type="text"
                              placeholder="Your name"
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              required
                            />
                            <Input
                              id="guest-email"
                              type="email"
                              placeholder="Your email"
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              required
                            />
                          </Row>
                        </Column>
                      )}
                      <Column fillWidth gap="8">
                        <textarea
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Write a comment..."
                          maxLength={2000}
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '12px',
                            borderRadius: '12px',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
                            color: isDark ? 'white' : 'black',
                            fontSize: '14px',
                            resize: 'vertical',
                            outline: 'none'
                          }}
                        />
                        <Row fillWidth horizontal="between" vertical="center">
                          <Text variant="body-default-xs" onBackground="neutral-weak">
                            {commentContent.length}/2000
                          </Text>
                          <Button
                            type="submit"
                            variant="primary"
                            size="m"
                            prefixIcon="send"
                            label={createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                            disabled={createCommentMutation.isPending || !commentContent.trim()}
                          />
                        </Row>
                      </Column>
                    </Column>
                  </form>
                </Column>
              )}
            </Column>

            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}