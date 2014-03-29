<h1>An imgur scraper and data visualizer.</h1>

<p>
The scraper hits public api end points on imgur and aggregates data based on different time lapses such as hours, weekdays, months, years, and deltas. <br/>
The aggregated data is then stored into several mongodb collections. <br/>
Then we use d3 http://d3js.org/ to visualize the data and form graphs. <br/>

custom.html and custom.js introduce extended functionality that allows the creation of custom graphs on the fly.
</p>
<p>
Running scraper.py initiates the scraper. <br/>
dbJobs.py contains miscellanious operations and debugging functions on the database.
</p>

<p>
Dependencies: 
<ul>
<li>python 2.7+</li>
<li>mongodb</li>
</ul>
</p>





