'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProfiles(currentUserId?: string) {
    try {
        const profiles = await prisma.user.findMany({
            include: {
                posts: {
                    include: {
                        comments: {
                            where: { parentId: null },
                            include: {
                                author: true,
                                replies: {
                                    include: {
                                        author: true
                                    },
                                    orderBy: { createdAt: 'asc' }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        },
                        likes_list: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                reviews: {
                    include: {
                        author: true
                    }
                },
                following: true,
                followedBy: true
            },
            where: {
                role: {
                    not: 'public'
                }
            }
        });

        // Enrich with isFollowed and derived followers count
        return profiles.map((profile: any) => ({
            ...profile,
            followers: profile.followedBy.length,
            isFollowed: currentUserId ? profile.followedBy.some((f: any) => f.followerId === currentUserId) : false,
            posts: profile.posts.map((post: any) => ({
                ...post,
                isLiked: currentUserId ? post.likes_list.some((l: any) => l.userId === currentUserId) : false
            }))
        }));
    } catch (error) {
        console.error('Failed to fetch profiles:', error);
        return [];
    }
}

export async function updateProfile(userId: string, data: { name?: string, bio?: string, image?: string, location?: string, tags?: string[] }) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...data
            }
        });
        revalidatePath(`/network/${userId}`);
        revalidatePath('/network');
        return user;
    } catch (error) {
        console.error('Failed to update profile:', error);
        throw new Error('Failed to update profile');
    }
}

export async function updateRole(userId: string, newRole: string) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
        revalidatePath(`/network/${userId}`);
        revalidatePath('/network');
        return user;
    } catch (error) {
        console.error('Failed to update role:', error);
        throw new Error('Failed to update role');
    }
}

export async function getProfileById(id: string) {
    try {
        return await prisma.user.findUnique({
            where: { id },
            include: {
                posts: {
                    orderBy: { createdAt: 'desc' }
                },
                reviews: {
                    include: {
                        author: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to get profile:', error);
        return null;
    }
}

export async function followProfile(userId: string, targetId: string) {
    if (userId === targetId) {
        throw new Error("Vous ne pouvez pas vous suivre vous-même.");
    }

    try {
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetId
                }
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.$transaction([
                prisma.follow.delete({
                    where: { id: existingFollow.id }
                }),
                prisma.user.update({
                    where: { id: targetId },
                    data: { followers: { decrement: 1 } }
                }),
                prisma.notification.deleteMany({
                    where: {
                        userId: targetId,
                        type: 'follow',
                        link: `/network/${userId}`
                    }
                })
            ]);

            const updatedProfile = await prisma.user.findUnique({
                where: { id: targetId },
                include: { followedBy: true }
            });

            return { success: true, isFollowed: false, followers: updatedProfile?.followedBy.length || 0 };
        } else {
            // Follow
            await prisma.$transaction(async (tx: any) => {
                // Safety check: check again inside transaction to prevent duplicates
                const check = await tx.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: userId,
                            followingId: targetId
                        }
                    }
                });

                if (check) return; // Already following

                await tx.follow.create({
                    data: {
                        followerId: userId,
                        followingId: targetId
                    }
                });
                await tx.user.update({
                    where: { id: targetId },
                    data: { followers: { increment: 1 } }
                });

                const existingNotif = await tx.notification.findFirst({
                    where: {
                        userId: targetId,
                        type: 'follow',
                        link: `/network/${userId}`
                    }
                });

                if (existingNotif) {
                    await tx.notification.update({
                        where: { id: existingNotif.id },
                        data: {
                            read: false,
                            createdAt: new Date()
                        }
                    });
                } else {
                    await tx.notification.create({
                        data: {
                            userId: targetId,
                            type: 'follow',
                            title: 'Nouvel abonné',
                            message: 'Une personne vous suit désormais.',
                            link: `/network/${userId}`,
                            read: false
                        }
                    });
                }
            });

            const updatedProfile = await prisma.user.findUnique({
                where: { id: targetId },
                include: { followedBy: true }
            });

            return { success: true, isFollowed: true, followers: updatedProfile?.followedBy.length || 0 };
        }
    } catch (error) {
        console.error('Failed to toggle follow:', error);
        throw new Error('Failed to follow');
    }
}

export async function addReview(authorId: string, targetId: string, data: { rating: number, text: string }) {
    try {
        const review = await prisma.review.create({
            data: {
                authorId,
                targetId,
                rating: data.rating,
                text: data.text
            }
        });

        // Notify target user
        if (authorId !== targetId) {
            await prisma.notification.create({
                data: {
                    userId: targetId,
                    type: 'review',
                    title: 'Nouvel avis',
                    message: 'Vous avez reçu un nouvel avis.',
                    link: `/network/${targetId}`,
                    read: false
                }
            });
        }

        revalidatePath(`/network/${targetId}`);
        return review;
    } catch (error) {
        console.error('Failed to add review:', error);
        throw new Error('Failed to add review');
    }
}

export async function addPost(authorId: string, data: { content: string, image?: string }) {
    try {
        const post = await prisma.post.create({
            data: {
                authorId,
                content: data.content,
                image: data.image,
                likes: 0
            }
        });
        revalidatePath(`/network/${authorId}`);
        revalidatePath('/');
        return post;
    } catch (error) {
        console.error('Failed to add post:', error);
        throw new Error('Failed to add post');
    }
}

export async function addComment(authorId: string, postId: string, text: string, parentId?: string) {
    try {
        const comment = await prisma.comment.create({
            data: {
                authorId,
                postId,
                text,
                parentId
            },
            include: {
                author: true,
                post: true
            }
        });

        // Notify post author if commenter is not author
        if (comment.post.authorId !== authorId) {
            // For comments, we generally allow multiple notifications as each comment is unique content
            // But we can check if there was a very recent identical one if needed.
            // For now, simpler check: just ensure not self.
            await prisma.notification.create({
                data: {
                    userId: comment.post.authorId,
                    type: 'comment',
                    title: 'Nouveau commentaire',
                    message: 'Quelqu\'un a commenté votre publication.',
                    link: `/network/${comment.post.authorId}`,
                    read: false
                }
            });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (post) {
            revalidatePath(`/network/${post.authorId}`);
        }
        return comment;
    } catch (error) {
        console.error('Failed to add comment:', error);
        throw new Error('Failed to add comment');
    }
}

export async function likePost(postId: string, userId: string) {
    try {
        const existingLike = await prisma.postLike.findUnique({
            where: {
                userId_postId: { userId, postId }
            }
        });

        let post;

        if (existingLike) {
            // Unlike
            const [deletedLike, updatedPost] = await prisma.$transaction([
                prisma.postLike.delete({ where: { id: existingLike.id } }),
                prisma.post.update({
                    where: { id: postId },
                    data: { likes: { decrement: 1 } }
                })
            ]);
            post = updatedPost;
        } else {
            // Like
            const [newLike, updatedPost] = await prisma.$transaction([
                prisma.postLike.create({
                    data: { userId, postId }
                }),
                prisma.post.update({
                    where: { id: postId },
                    data: { likes: { increment: 1 } }
                })
            ]);
            post = updatedPost;

            // Notify post author if liker is not author
            const postData = await prisma.post.findUnique({ where: { id: postId } });
            if (postData && postData.authorId !== userId) {
                const existingLikeNotif = await prisma.notification.findFirst({
                    where: {
                        userId: postData.authorId,
                        type: 'like',
                        link: `/network/${postData.authorId}`, // This link logic is a bit weak for uniqueness, ideally should link to post
                        read: false
                    }
                });

                if (!existingLikeNotif) {
                    await prisma.notification.create({
                        data: {
                            userId: postData.authorId,
                            type: 'like',
                            title: 'Nouveau J\'aime',
                            message: 'Quelqu\'un a aimé votre publication.',
                            link: `/network/${postData.authorId}`,
                            read: false
                        }
                    });
                }
            }
        }

        return post;
    } catch (error) {
        console.error('Failed to toggle like post:', error);
        throw new Error('Failed to toggle like');
    }
}

