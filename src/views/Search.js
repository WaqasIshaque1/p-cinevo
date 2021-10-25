import React from 'react';
import { Helmet } from 'react-helmet';
import { Redirect, useHistory, useRouteMatch } from 'react-router-dom';
import { Arrow } from '../components/Arrow';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { InputBox } from '../components/InputBox';
import { MovieRow } from '../components/MovieRow';
import { Progress } from '../components/Progress';
import { Title } from '../components/Title';
import { TypeSelector } from '../components/TypeSelector';
import { useMovie } from '../hooks/useMovie';
import { findContent, getEpisodes, getStreamUrl } from '../lib/index';
import { VideoProgressStore } from '../lib/storage/VideoProgress'

import './Search.css';

export function SearchView() {
    const { navigate, setStreamUrl, setStreamData } = useMovie();

    const history = useHistory();
    const routeMatch = useRouteMatch('/:type');
    const type = routeMatch?.params?.type;
    const streamRouteMatch = useRouteMatch('/:type/:source/:title/:slug');

    const maxSteps = 4;
    const [options, setOptions] = React.useState([]);
    const [progress, setProgress] = React.useState(0);
    const [text, setText] = React.useState("");
    const [failed, setFailed] = React.useState(false);
    const [showingOptions, setShowingOptions] = React.useState(false);
    const [errorStatus, setErrorStatus] = React.useState(false);
    const [page, setPage] = React.useState('search');
    const [continueWatching, setContinueWatching] = React.useState([])

    const fail = (str) => {
        setProgress(maxSteps);
        setText(str)
        setFailed(true)
    }

    async function getStream(title, slug, type, source, year) {
        setStreamUrl("");

        try {
            setProgress(2);
            setText(`Getting stream for "${title}"`);

            let seasons = [];
            let episodes = [];
            if (type === "show") {
                const data = await getEpisodes(slug, source);
                seasons = data.seasons;
                episodes = data.episodes;
            }

            let realUrl = '';
            let subtitles = []

            if (type === "movie") {
                const { url, subtitles: subs } = await getStreamUrl(slug, type, source);

                if (url === '') {
                    return fail(`Not found: ${title}`)
                }

                realUrl = url;
                subtitles = subs
            }

            setProgress(maxSteps);
            setStreamUrl(realUrl);
            setStreamData({
                title,
                type,
                seasons,
                episodes,
                slug,
                source,
                year,
                subtitles
            })
            setText(`Streaming...`)
            navigate("movie")
        } catch (err) {
            console.error(err);
            fail("Failed to get stream")
        }
    }

    async function searchMovie(query, contentType) {
        setFailed(false);
        setText(`Searching for ${contentType} "${query}"`);
        setProgress(1)
        setShowingOptions(false)

        try {
            const { options } = await findContent(query, contentType);

            if (options.length === 0) {
                return fail(`Could not find that ${contentType}`)
            } else if (options.length > 1) {
                setProgress(2);
                setText(`Choose your ${contentType}`);
                setOptions(options);
                setShowingOptions(true);
                return;
            }

            const { title, slug, type, source, year } = options[0];
            history.push(`${routeMatch.url}/${source}/${title}/${slug}`);
            getStream(title, slug, type, source, year);
        } catch (err) {
            console.error(err);
            fail(`Failed to watch ${contentType}`)
        }
    }

    React.useEffect(() => {
        async function fetchHealth() {
            await fetch(process.env.REACT_APP_CORS_PROXY_URL).catch(() => {
                // Request failed; source likely offline
                setErrorStatus(`Our content provider is currently offline, apologies.`)
            })
        }
        fetchHealth()
    }, []);

    React.useEffect(() => {
        if (streamRouteMatch) {
            if (streamRouteMatch?.params.type === 'movie' || streamRouteMatch.params.type === 'show') getStream(streamRouteMatch.params.title, streamRouteMatch.params.slug, streamRouteMatch.params.type, streamRouteMatch.params.source);
            else return setErrorStatus("Failed to find movie. Please try searching below.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const progressData = VideoProgressStore.get();
        let newContinueWatching = []

        Object.keys(progressData).forEach((source) => {
            const all = [
                ...Object.entries(progressData[source]?.show ?? {}),
                ...Object.entries(progressData[source]?.movie ?? {})
            ];

            for (const [slug, data] of all) {
                for (let subselection of Object.values(data)) {
                    let entry = {
                        slug,
                        data: subselection,
                        type: subselection.show ? 'show' : 'movie',
                        percentageDone: Math.floor((subselection.currentlyAt / subselection.totalDuration) * 100),
                        source
                    }

                    // due to a constraint with incompatible localStorage data,
                    // we must quit here if episode and season data is not included
                    // in the show's data. watching the show will resolve.
                    if (!subselection.meta) continue;

                    if (entry.percentageDone < 90) {
                        newContinueWatching.push(entry)
                        // begin next episode logic
                    } else {
                        // we can't do next episode for movies!
                        if (!subselection.show) continue;

                        let newShow = {};

                        // if the current season has a next episode, load it
                        if (subselection.meta.episodes[subselection.show.season].includes(`${parseInt(subselection.show.episode) + 1}`)) {
                            newShow.season = subselection.show.season;
                            newShow.episode = `${parseInt(subselection.show.episode) + 1}`;
                            entry.percentageDone = 0;
                            // if the current season does not have a next epsiode, and the next season has a first episode, load that
                        } else if (subselection.meta.episodes?.[`${parseInt(subselection.show.season) + 1}`]?.[0]) {
                            newShow.season = `${parseInt(subselection.show.season) + 1}`;
                            newShow.episode = subselection.meta.episodes[`${parseInt(subselection.show.season) + 1}`][0];
                            entry.percentageDone = 0;
                            // the next episode does not exist
                        } else {
                            continue;
                        }

                        // assign the new episode and season data
                        entry.data.show = { ...newShow };

                        // if the next episode exists, continue. we don't want to end up with duplicate data.
                        let nextEpisode = progressData?.[source]?.show?.[slug]?.[`${entry.data.show.season}-${entry.data.show.episode}`];
                        if (nextEpisode) continue;

                        newContinueWatching.push(entry);
                    }
                }
            }

            newContinueWatching = newContinueWatching.sort((a, b) => {
                return b.data.updatedAt - a.data.updatedAt
            });

            setContinueWatching(newContinueWatching)
        })
    }, []);

    if (!type || (type !== 'movie' && type !== 'show')) {
        return <Redirect to="/movie" />
    }

    return (
        <div className="cardView">
            <Helmet>
                <title>{type === 'movie' ? 'movies' : 'shows'} | movie-web</title>
            </Helmet>

            {/* Nav */}
            <nav>
                <span className={page === 'search' ? 'selected-link' : ''} onClick={() => setPage('search')}>Search</span>
                {continueWatching.length > 0 ?
                    <span className={page === 'watching' ? 'selected-link' : ''} onClick={() => setPage('watching')}>Continue watching</span>
                    : ''}
            </nav>

            {/* Search */}
            {page === 'search' ?
                <React.Fragment>
                    <Card>
                        {errorStatus ? <ErrorBanner>{errorStatus}</ErrorBanner> : ''}
                        <Title accent="Because watching content legally is boring">
                            What do you wanna watch?
                        </Title>
                        <TypeSelector
                            setType={(type) => history.push(`/${type}`)}
                            choices={[
                                { label: "Movie", value: "movie" },
                                { label: "TV Show", value: "show" }
                            ]}
                            noWrap={true}
                            selected={type}
                        />
                        <InputBox placeholder={type === "movie" ? "Hamilton" : "Atypical"} onSubmit={(str) => searchMovie(str, type)} />
                        <Progress show={progress > 0} failed={failed} progress={progress} steps={maxSteps} text={text} />
                    </Card>

                    <Card show={showingOptions} doTransition>
                        <Title size="medium">
                            Whoops, there are a few {type}s like that
                        </Title>
                        {Object.entries(options.reduce((a, v) => {
                            if (!a[v.source]) a[v.source] = []
                            a[v.source].push(v)
                            return a;
                        }, {})).map(v => (
                            <div key={v[0]}>
                                <p className="source">{v[0]}</p>
                                {v[1].map((v, i) => (
                                    <MovieRow key={i} title={v.title} slug={v.slug} type={v.type} year={v.year} source={v.source} onClick={() => {
                                        history.push(`${routeMatch.url}/${v.source}/${v.title}/${v.slug}`);
                                        setShowingOptions(false)
                                        getStream(v.title, v.slug, v.type, v.source, v.year)
                                    }} />
                                ))}
                            </div>
                        ))}
                    </Card>
                </React.Fragment> : <React.Fragment />}

            {/* Continue watching */}
            {continueWatching.length > 0 && page === 'watching' ? <Card>
                <Title>Continue watching</Title>
                <Progress show={progress > 0} failed={failed} progress={progress} steps={maxSteps} text={text} />
                {continueWatching?.map((v, i) => (
                    <MovieRow key={i} title={v.data.meta.title} slug={v.data.meta.slug} type={v.type} year={v.data.meta.year} source={v.source} place={v.data.show} percentage={v.percentageDone} deletable onClick={() => {
                        if (v.type === 'show') {
                            history.push(`/show/${v.source}/${v.data.meta.title}/${v.slug}/season/${v.data.show.season}/episode/${v.data.show.episode}`)
                        } else {
                            history.push(`/movie/${v.source}/${v.data.meta.title}/${v.slug}`)
                        }

                        setShowingOptions(false)
                        getStream(v.data.meta.title, v.data.meta.slug, v.type, v.source, v.data.meta.year)
                    }} />
                ))}
            </Card> : <React.Fragment></React.Fragment>}

            <div className="topRightCredits">
                <a href="https://github.com/JamesHawkinss/movie-web" target="_blank" rel="noreferrer">Check it out on GitHub <Arrow /></a>
                <br />
                <a href="https://discord.gg/vXsRvye8BS" target="_blank" rel="noreferrer">Join the Discord <Arrow /></a>
            </div>
        </div>
    )
}
