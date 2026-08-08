function moviecard(movie) {
    function onfevClick(){
        alart ("clicked")
    }
    return (
        <div classNmae = "movie_card"> 
            <div className = "movie poster" >
                <img src={movie.url} alt={movie.title} />
                <div class = "movie_overlay" >  
                    <button class = "fev_btw" onClick={onfevClick}>
                        ❤️
                    </button>
                </div>
            </div>

        <div className = "movie info" >
            <h3>{movie.title}</h3>
            <p>{movie.release_date}</p>
        </div >
        </div>
    )
}
export default moviecard