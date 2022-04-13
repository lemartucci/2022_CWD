# Team Name

### Team Members
1. Lauren Martucci
2. Lukas Wellenstein
3. Katherine Koehler

### Final Proposal
1. **User Profile**
    1. **Target User Persona: Wildlife Disease Expert in Midwest**

        Our hypothetical wildlife disease expert has been studying the spread of CWD in the midwest and has been tasked by the Department of Fish & Wildlife with redesigning/updating state-wide monitoring, prevention, and reporting programs based on past and present CWD data and policies. It will be important to collaborate with wildlife disease experts and policy makers in neighboring states and to use a data visualization tool to identify areas of greatest concern in order to focalize monitoring, prevention, and community education efforts. The ability to **identify** areas of greatest concern/risk, **compare** CWD cases across states, counties, and regions over time, and **rank** areas by CWD cases is imperative for evaluating current policies and management practices and informing revisions to those policies and management practices. In using the interactive CWD map, the wildlife disease expert intends to determine **causations** of spread, analyze **patterns** and **trends** and identify **outliers** so that they can share their **insights** and recommendations for CWD mitigation efforts to the Department of Fish & Wildlife. Additionally, the wildlife expert will work on increasing awareness of CWD through educational outreach programs geared towards the general public and the hunting community; to accomplish this **goal**, they will reference the interactive CWD map and share it as a resource for interested parties.

    2. **User Case Scenario**

        When accessing the CWD map, the wildlife disease expert is welcomed with a popup that provides a textual overview for navigating the site and a clear entry point for interaction with a "click here to begin" button. Upon closing the popup they see an introduction to CWD, an interactive donut chart that shows CWD cases in wild and captive cervids by Midwest state, and a static map of CWD spread in the contiguous U.S. They are quickly able to gain **insight** into state-level cervid CWD case makeup by interacting with the donut chart and viewing the static map of the U.S. which enables them to **identify** and **compare** areas of CWD spread and examine **clusters** of CWD outbreaks. Interested in the Midwest, they click "Midwest" in the top menu bar and arrive at the interactive map of CWD spread and policy for the Midwest; they **filter** the data to display state level CWD data which generates proportional symbols over each state; interested in change over time they click on the temporal **sequence** tool. The proportional symbols change to display CWD cases in 5 year intervals.They notice Wisconsin is an **outlier** in that it has seen the largest growth of CWD cases in the Midwest over time. They click on Wisconsin and a popup appears, **retrieving** the year and exact CWD case number for Wisconsin. Interested in visualizing additional data, they **overlay** the number of hunters registered per state and subsequently the number of deer harvested per state, both layers depicted as choropleth base maps, placed under the case numbers proportional symbols.
        
        
2. **Requirements Document**
    
    1. **Representation**
        1. **Basemap(Midwest)** 
            1. **Source:** Natural Earth: https://www.naturalearthdata.com/ 
            2. **Symbolization:** State outlines of midwestern states
        2. **DNR Regions** 
            1. **Source:** https://data-wi-dnr.opendata.arcgis.com/
            2. **Symbolization:** Outline of DNR regions
        3. **U.S. CWD cases/distribution**
            1. **Source:** https://www.usgs.gov/centers/nwhc/science/expanding-distribution-chronic-wasting-disease 
            2. **Symbolization:** Image of map from USGS or, if time allows, static map that we create
        4. **CWD cases in Midwest:**
            1. **Sources:** WI:https://dnr.wi.gov/wmcwd/Summary/County, MI:https://gis-midnr.opendata.arcgis.com/maps/291616c40b9044e9a73c61df5faaec85/about, IL: https://www2.illinois.gov/dnr/p, IA:https://www.iowadnr.gov/Hunting/Deer-Hunting/Deer-Health/Chronic-Wasting-Disease/Surveillance-Results, MO:https://mdc.mo.gov/hunting-trapping/species/deer/chronic-wasting-disease/cwd-surveillance
            2. Symbolization: Depicted by dots representing individual cases or proportional symbols based on chosen representation

        5. **Timeline**
            1. **Source:** https://cwd-info.org/timeline/    
                https://leg.mt.gov/content/Committees/Interim/2019-2020/EQC/Meetings/may-2020/cwd-other-states-regulation-comparison.pdf
            2. **Symbolization:** Scrolly timeline that gives important CWD policy updates over time

        6. **Legend**
            1. **Source:** Various data sources; dependent on variable being mapped
            2. **Symbolization:** Nested proportional symbols for proportional symbol map and color scale   for choropleth overlay

        7. **Overview**
            1. **Source:** Various informational CWD websites; USGS, State DNR
            2. **Symbolization:** Documentation on the background description and user guideline
    
    2. **Interaction**
        1. **State selection:**
            1. **Operator, Operand:** Retrieve: objects.

            2. **Description:** Hover to highlight state and click to retrieve popup information window.

        2. **Context overlay**
            1. **Operator, Operand:** Overlay: objects.

            2. **Description:** Click button to turn on/off choropleth overlay of number of deers harvested or number of registered hunters. 

        3. **Time animation**
            1. **Operator, Operand:**  Sequence: time

            2. **Description:** Press play to sequence through the years from 2000 to 2020; time interval will be every 5 years and the user will be able to pause the sequence.  

        4. **Timeline Search**
            1. **Operator, Operand:** Search: objects

            2. **Description:** Type a feature of interest in the search bar and the word will be highlighted in the scrolly timeline, if it exists. 

        5. **Donut chart menu selection**
            1. **Operator, Operand:**

            2. **Description:** Type a feature of interest in the search bar and the word will be highlighted in the scrolly timeline, if it exists. 

        6. **Aggregate by state or county**
            1. **Operator, Operand:** Resymbolize: objects.

            2. **Description:** Click button to aggregate CWD cases by state or county. 

        7. **Zoom**
            1. **Operator, Operand:** Zoom: location. 

            2. **Description:** Click stored hyperlink to be taken to a page with background about the project. 

        8. **Link to About page**
            1. **Operator, Operand:** Retrieve: objects

            2. **Description:** Click stored hyperlink to be taken to a page with background about the project. 

        9. **Link to Report a bug document:**
            1. **Operator, Operand:** Retrieve: objects

            2. **Description:** Click stored hyperlink to be taken to an open document where users can report any problems or give feedback. 

        10. **Link to What is CWD section**
            1. **Operator, Operand:** reexpress: Objects 

            2. **Description:** Clicking button takes user directly to the section explaining CWD. 

        11. **Link to Midwest section**
            1. **Operator, Operand:** Reexpress: Objects 

            2. **Description:** Clicking button takes user directly to the section with interactive map and info scroller about CWD in the midwest region.

        12. **Link to Resources section**
            1. **Operator, Operand:** Reexpress: Objects 

            2. **Description:** Clicking button takes users to the section of hyperlinks with further information on the topic. 

3. **Wireframes**
Documented in submitted PDF





