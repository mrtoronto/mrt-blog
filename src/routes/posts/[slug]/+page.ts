import { error } from '@sveltejs/kit';
import { posts } from '$lib/data/content';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => {
	return posts.map((post) => ({ slug: post.slug }));
};

export const load: PageLoad = ({ params }) => {
	const post = posts.find((item) => item.slug === params.slug);
	if (!post) {
		throw error(404, 'Post not found');
	}
	return { post };
};
