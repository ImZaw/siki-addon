const { Siki } = require("siki");
const akwam = new Siki("akwam")
const cimanow = new Siki("wecima")
cimanow.providerClass.mainUrl = "https://arab-hnl6e7ta2pmy.runkit.sh/?url=https://wecima.show"
function toMetaData(array, type, provider) {
    return array.map(i=> {
        let urlData = i.data
        if(provider) urlData = provider + "|" + urlData
        return { 
            id: urlData, 
            type, 
            name: i.title, 
            poster: i.posterUrl, 
            releaseInfo: i.year, 
            imdbRating: i.rating,
            genres: i.genres
    }})
}
async function catalog (type, id, extra) {
    try {
        if(id.includes("Akwam")) {
            let data = await akwam.homePage() ?? []
            if(id.includes("Movies")) {
                let movies = data.find((item) => item.title == "Movies")
                return toMetaData(movies.posts, "movie", "Akwam")
            } else if(id.includes("Series")) {
                let series = data.find((item) => item.title == "Series")
                return toMetaData(series.posts, "series", "Akwam")
            }
        } else if (id.includes("CimaNow")) {
            let data = await cimanow.homePage() ?? []
            if(id.includes("Movies")) {
                let movies = data.filter((item) => item.title.includes("Movies"))
                let Allposts = []
                movies.forEach(element => {
                    element.posts.forEach(i=> Allposts.push(i))
                });
                return toMetaData(Allposts, "movie", "CimaNow")
            } else if(id.includes("Series")) {
                let series = data.filter((item) => item.title.includes("Series"))
                let Allposts = []
                series.forEach(element => {
                    element.posts.forEach(i=> Allposts.push(i))
                });
                return toMetaData(Allposts, "series", "CimaNow")
            }
        } else return null;
    }
    catch(error) {
        console.log(error);
    }
}
async function search(type, query) {
    let akwamData = await akwam.search(query) ?? []
    let cimanowData = await cimanow.search(query) ?? []
    if(type == "movie") {
            let Allposts = []
            akwamData.filter(i=> i.tvType.name == "Movie").forEach(i=> {
                i.title = i.title + " - Akwam"
                i.data = "Akwam|" + i.data
                Allposts.push(i)
            })
            cimanowData.filter(i=> i.tvType.name == "Movie").forEach(i=> {
                i.title = i.title + " - CimaNow"
                i.data = "CimaNow|" + i.data
                Allposts.push(i)
            })
            return toMetaData(Allposts, "movie")
    } else if(type == "series") {
            let Allposts = []
            akwamData.filter(i=> i.tvType.name == "TVSeries").forEach(i=> {
                i.title = i.title + " - Akwam"
                i.data = "Akwam|" + i.data
                Allposts.push(i)
            })
            cimanowData.filter(i=> i.tvType.name == "TVSeries").forEach(i=> {
                i.title = i.title + " - CimaNow"
                i.data = "CimaNow|" + i.data
                Allposts.push(i)
            })
            return toMetaData(Allposts, "series")
    } else return null;
}
async function meta (type, id) {
    let provider = id.split("|")[0]
    let data = id.split("|")[1]
    let metaData;
    if(provider == "Akwam") {
        metaData = await akwam.load(data)
    } else if (provider == "CimaNow") {
        metaData = await cimanow.load(data)
    }
    let rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    let episodes = []
    if(metaData.tvType.name == "TVSeries") {
        metaData.seasons.forEach(seasonData=> {
            seasonData.episodes.forEach(episodeData=> {
                episodes.push({
                    id: provider + "|" + episodeData.data,
                    title: episodeData.title,
                    thumbnail: episodeData.thumbnail,
                    episode: Number(episodeData.episode),
                    season: Number(seasonData.season_number),
                    overview: episodeData.plot
                })
            })
        })
    }
    return {
        id,
        type,
        name: metaData.title,
        genres: metaData.genres,
        poster: metaData.posterUrl,
        description: metaData.plot,
        releaseInfo: metaData.year,
        trailers: [{ "source": metaData.trailer?.match(rx)[1] ?? "", "type": "Trailer" }],
        language: metaData.language?.toString() ?? "",
        country: metaData.country?.toString() ?? "",
        videos: episodes
    }
}

async function stream (type, id) {
    let provider = id.split("|")[0]
    let data = id.split("|")[1]
    let linksData;
    if(provider == "Akwam") {
        linksData = await akwam.loadLinks(data)
    } else if (provider == "CimaNow") {
        linksData = await cimanow.loadLinks(data)
    }
    return linksData.map(i=> {return {
        url: i.url,
        name: i.title,
        description: i.quality
    }})
}

module.exports = {
    search,
    catalog,
    meta,
    stream
};
