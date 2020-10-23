import { archiveSVG, upvoteSVG, downvoteSVG, trashSVG } from './svg';

let topics = [];

const init = async () => {
	const endpoint =
		'https://gist.githubusercontent.com/Pinois/93afbc4a061352a0c70331ca4a16bb99/raw/6da767327041de13693181c2cb09459b0a3657a1/topics.json';
	const result = await fetch(endpoint);
	topics = await result.json();
	showTopics(topics);
	return topics;
};

init();

const addTopicForm = document.querySelector('form');
const nextTopicContainer = document.querySelector('.next-topic-container');
const prevTopicContainer = document.querySelector('.prevTopicContainer');

const showTopics = topics => {
	// only use the topics we want to
	let nextTopics = topics.filter(topic => !topic.discussedOn);

	// sort them the way we want
	nextTopics = nextTopics.sort((topicA, topicB) => {
		const ratioA = topicA.upvotes - topicA.downvotes;
		const ratioB = topicB.upvotes - topicB.downvotes;
		return ratioB - ratioA;
	});

	const nextTopicHtml = nextTopics
		.map(
			topic => `
				<article>
					<button class="archive" data-id="${topic.id}">
						${archiveSVG}
					</button>
					<h5 class="topic-text">${topic.title}</h5>
					<div class="votes">
						<button class="upvote" data-id="${topic.id}">
							${upvoteSVG}
						</button>
						<span class="upvote-number">${topic.upvotes}</span>
						<button class="downvote" data-id="${topic.id}">
							${downvoteSVG}
						</button>
						<span class="downvote-number">${topic.downvotes}</span>
					</div>
				</article>
    `
		)
		.join('');
	nextTopicContainer.innerHTML = nextTopicHtml;

	const prevTopics = topics.filter(topic => topic.discussedOn);
	const prevTopicHtml = prevTopics
		.map(topic => {
			const discussedOnDate = new Date(Number(topic.discussedOn));
			return `
                <article>
                    <button class="delete" data-id="${topic.id}">
                        ${trashSVG}
                    </button>
                    <h5 class="topic-text">${topic.title}</h5>
                    <p>Discussed on ${discussedOnDate.toLocaleDateString()}
                </article>
            `;
		})
		.join('');
	prevTopicContainer.innerHTML = prevTopicHtml;
};

const handleClick = e => {
	const archiveBtn = e.target.closest('button.archive');
	if (archiveBtn) {
		archiveTopic(archiveBtn.dataset.id, topics);
	}
	const upvoteBtn = e.target.closest('button.upvote');
	if (upvoteBtn) {
		upvoteTopic(upvoteBtn.dataset.id, topics);
	}
	const downvoteBtn = e.target.closest('button.downvote');
	if (downvoteBtn) {
		downvoteTopic(downvoteBtn.dataset.id, topics);
	}
	const deleteBtn = e.target.closest('button.delete');
	if (deleteBtn) {
		deleteTopic(deleteBtn.dataset.id, topics);
	}
};

const archiveTopic = (id, topics) => {
	const topicToArchive = topics.find(topic => topic.id === id);
	topicToArchive.discussedOn = new Date(); // add a timestamp to the attribute
	showTopics(topics);
};

const upvoteTopic = (id, topics) => {
	const topicToUpvote = topics.find(topic => topic.id === id);
	topicToUpvote.upvotes++;
	showTopics(topics);
};
const downvoteTopic = (id, topics) => {
	const topicToDownvote = topics.find(topic => topic.id === id);
	topicToDownvote.downvotes++;
	showTopics(topics);
};

const deleteTopic = (id, topics) => {
	// need to use a mutable method here
	topics.forEach((topic, index) => {
		if (topic.id === id) {
			topics.splice(index, 1);
		}
	});
	showTopics(topics);
};

const handleSubmit = e => {
	e.preventDefault();
	let newTopic = createNewTopic(e.currentTarget.topic.value);
	topics.push(newTopic);
	showTopics(topics);
	addTopicForm.reset();
};

const createNewTopic = title => {
	return {
		upvotes: 0,
		downvotes: 0,
		disussedOn: '',
		title: title,
		id: Date.now(),
	};
};


addTopicForm.addEventListener('submit', handleSubmit);
document.body.addEventListener('click', handleClick);
