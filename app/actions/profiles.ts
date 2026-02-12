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

        // Explicitly map to clean objects to avoid serialization issues with deep Prisma objects
        return profiles.map((p: any) => ({
            id: p.id,
            name: p.name || 'Utilisateur',
            email: p.email,
            role: p.role,
            location: p.location,
            image: p.image,
            tags: p.tags || [],
            bio: p.bio,
            rating: p.rating || 0,
            followers: p.followedBy?.length || 0,
            isFollowed: currentUserId ? p.followedBy?.some((f: any) => f.followerId === currentUserId) : false,
            reviews: (p.reviews || []).map((r: any) => ({
                id: r.id,
                rating: r.rating,
                text: r.text,
                createdAt: r.createdAt.toISOString(),
                author: {
                    id: r.author?.id,
                    name: r.author?.name || 'Utilisateur',
                    image: r.author?.image
                }
            })),
            posts: (p.posts || []).map((post: any) => ({
                id: post.id,
                content: post.content,
                image: post.image,
                likes: post.likes || 0,
                createdAt: post.createdAt.toISOString(),
                isLiked: currentUserId ? post.likes_list?.some((l: any) => l.userId === currentUserId) : false,
                comments: (post.comments || []).map((c: any) => ({
                    id: c.id,
                    text: c.text,
                    createdAt: c.createdAt.toISOString(),
                    author: {
                        id: c.author?.id,
                        name: c.author?.name || 'Utilisateur',
                        image: c.author?.image
                    },
                    replies: (c.replies || []).map((rep: any) => ({
                        id: rep.id,
                        text: rep.text,
                        createdAt: rep.createdAt.toISOString(),
                        author: {
                            id: rep.author?.id,
                            name: rep.author?.name || 'Utilisateur',
                            image: rep.author?.image
                        }
                    }))
                }))
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

export async function getProfileById(id: string, currentUserId?: string) {
    try {
        const p = await prisma.user.findUnique({
            where: { id },
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
            }
        });

        if (!p) return null;

        // Map to clean object
        return {
            id: p.id,
            name: p.name || 'Utilisateur',
            email: p.email,
            role: p.role,
            location: p.location,
            image: p.image,
            tags: p.tags || [],
            bio: p.bio,
            rating: p.rating || 0,
            followers: p.followedBy?.length || 0,
            isFollowed: currentUserId ? p.followedBy?.some((f: any) => f.followerId === currentUserId) : false,
            reviews: (p.reviews || []).map((r: any) => ({
                id: r.id,
                rating: r.rating,
                text: r.text,
                createdAt: r.createdAt.toISOString(),
                author: {
                    id: r.author?.id,
                    name: r.author?.name || 'Utilisateur',
                    image: r.author?.image
                }
            })),
            posts: (p.posts || []).map((post: any) => ({
                id: post.id,
                content: post.content,
                image: post.image,
                likes: post.likes || 0,
                createdAt: post.createdAt.toISOString(),
                isLiked: currentUserId ? post.likes_list?.some((l: any) => l.userId === currentUserId) : false,
                comments: (post.comments || []).map((c: any) => ({
                    id: c.id,
                    text: c.text,
                    createdAt: c.createdAt.toISOString(),
                    author: {
                        id: c.author?.id,
                        name: c.author?.name || 'Utilisateur',
                        image: c.author?.image
                    },
                    replies: (c.replies || []).map((rep: any) => ({
                        id: rep.id,
                        text: rep.text,
                        createdAt: rep.createdAt.toISOString(),
                        author: {
                            id: rep.author?.id,
                            name: rep.author?.name || 'Utilisateur',
                            image: rep.author?.image
                        }
                    }))
                }))
            }))
        };
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
    if (authorId === targetId) {
        throw new Error("Vous ne pouvez pas laisser un avis sur votre propre profil.");
    }

    try {
        // Upsert review (create or update)
        const review = await prisma.review.upsert({
            where: {
                authorId_targetId: {
                    authorId,
                    targetId
                }
            },
            update: {
                rating: data.rating,
                text: data.text,
                createdAt: new Date() // Update timestamp to show it's recent
            },
            create: {
                authorId,
                targetId,
                rating: data.rating,
                text: data.text
            }
        });

        // Recalculate average rating
        const allReviews = await prisma.review.findMany({
            where: { targetId },
            select: { rating: true }
        });

        const totalRating = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
        const averageRating = Number((totalRating / allReviews.length).toFixed(1));

        await prisma.user.update({
            where: { id: targetId },
            data: { rating: averageRating }
        });

        // Notify target user (only if it's a new review, or maybe notify on update too? let's stick to simple "New review" style for now)
        // Check if notification already exists to avoid spamming on updates
        const existingNotif = await prisma.notification.findFirst({
            where: {
                userId: targetId,
                type: 'review',
                link: `/network/${targetId}`, // Ideally should link to review anchor but simple link works
                read: false
            }
        });

        if (!existingNotif) {
            await prisma.notification.create({
                data: {
                    userId: targetId,
                    type: 'review',
                    title: 'Nouvel avis',
                    message: 'Vous as reçu un avis sur votre profil.',
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

export async function deleteReview(reviewId: string, userId: string) {
    try {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: { author: true }
        });

        if (!review) throw new Error("Avis non trouvé");

        // Check permissions: author can delete, admin can delete
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const isAdmin = user?.appRole === 'ADMIN';

        if (review.authorId !== userId && !isAdmin) {
            throw new Error("Non autorisé à supprimer cet avis");
        }

        const targetId = review.targetId;

        await prisma.review.delete({
            where: { id: reviewId }
        });

        // Recalculate average rating
        const allReviews = await prisma.review.findMany({
            where: { targetId },
            select: { rating: true }
        });

        const totalRating = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
        const averageRating = allReviews.length > 0 ? Number((totalRating / allReviews.length).toFixed(1)) : 0;

        await prisma.user.update({
            where: { id: targetId },
            data: { rating: averageRating }
        });

        revalidatePath(`/network/${targetId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete review:', error);
        throw new Error('Failed to delete review');
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

