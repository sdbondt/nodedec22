const createCourseSearchParams = (req) => {
    let { name, cost, rating, sortBy, direction, page, limit } = req.query
        direction = direction !== 'asc' ? '-': ''
        sortBy = sortBy === 'createdAt' ? 'createdAt' : sortBy === 'name' ? 'name' : sortBy === 'cost' ? 'cost': 'averageRating'
        sortBy = `${direction}${sortBy}`
        page = Number(page) || 1
        limit = Number(limit) || 5
        const skip = ( page - 1) * limit

        const queryObj = {}
        if (name) {
            // queryObj.name = { $regex: name, $options: 'i' }
            queryObj.$text = { $search: name }
            queryObj.score = { $meta: 'text score'}
        }
        
        if (cost) {
            const costQuery = JSON.parse(JSON.stringify(cost).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`))
            queryObj.cost = costQuery
        }
        
        if (rating) {
            const ratingQuery = JSON.parse(JSON.stringify(rating).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`))
            queryObj.averageRating = ratingQuery
    }
    return {
        queryObj,
        skip,
        limit,
        sortBy,
        page
    }
}

module.exports = createCourseSearchParams