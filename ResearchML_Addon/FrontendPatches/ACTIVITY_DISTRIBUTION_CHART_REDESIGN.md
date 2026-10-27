# Activity distribution chart redesign

The source archive does not contain a page file named `AnalyticsPage.tsx` or an `Analytics*` page; therefore I have not silently replaced an unknown chart in the live app. Locate the component rendering the congested activity-distribution pie chart and replace it with a **ranked horizontal lollipop/dot plot** or **treemap** rather than another pie/bar chart.

Recommended unique view for many activity types: **ranked lollipop plot**. Sort activities by count descending; show a thin horizontal stem and dot for each category, count label at end, display top 10 and group remainder as “Other”, wrap/shorten long names, and add a date-range filter. This avoids overlapping labels and communicates ranking better than a crowded pie. If category hierarchy exists (module → activity), use a treemap instead. Do not use a pie chart for many categories.

This is a design specification, not a claim that the chart has already been changed in the app. The actual chart component must be located in the user's current source before safely applying a replacement.
