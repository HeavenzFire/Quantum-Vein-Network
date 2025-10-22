
import React, { useRef, useEffect, useState } from 'react';
import { Node, Link } from '../types';

declare const d3: any;
declare const topojson: any;

interface GlobeVisualizationProps {
    nodes: Node[];
    links: Link[];
    isInitialized: boolean;
}

export const GlobeVisualization: React.FC<GlobeVisualizationProps> = ({ nodes, links, isInitialized }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [worldData, setWorldData] = useState<any>(null);
    const rotation = useRef<[number, number]>([0, 0]);

    useEffect(() => {
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((data: any) => {
            setWorldData(topojson.feature(data, data.objects.countries));
        });
    }, []);

    useEffect(() => {
        if (!isInitialized || !worldData || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = window.innerWidth;
        const height = window.innerHeight;
        svg.attr("width", width).attr("height", height);

        const projection = d3.geoOrthographic()
            .scale(Math.min(width, height) / 2.2)
            .translate([width / 2, height / 2])
            .clipAngle(90);

        const path = d3.geoPath().projection(projection);
        
        svg.selectAll("*").remove(); // Clear previous render

        const defs = svg.append("defs");
        const gradient = defs.append("radialGradient")
            .attr("id", "globeGradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(0,191,255,0.3)");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(10,10,26,0)");
        
        const oceanGradient = defs.append("radialGradient")
            .attr("id", "oceanGradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
        oceanGradient.append("stop").attr("offset", "0%").attr("stop-color", "#0A243F");
        oceanGradient.append("stop").attr("offset", "100%").attr("stop-color", "#0a0a1a");


        const g = svg.append("g");
        
        // Globe Atmosphere Glow
        g.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", projection.scale())
            .style("fill", "url(#globeGradient)");

        // Globe Sphere
        g.append("path")
            .datum({type: "Sphere"})
            .attr("d", path)
            .style("fill", "url(#oceanGradient)")
            .style("stroke", "rgba(0,191,255,0.4)")
            .style("stroke-width", "1px");

        // Land
        g.append("path")
            .datum(worldData)
            .attr("d", path)
            .style("fill", "#1a2a4a")
            .style("stroke", "#3a8db5")
            .style("stroke-width", "0.5px");

        // Links
        const linkPaths = g.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .style("fill", "none")
            .style("stroke-width", 1.5)
            .style("stroke", "rgba(255, 0, 110, 0.6)")
            .style("opacity", 0.6);

        // Nodes
        const nodeElements = g.selectAll(".node")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 4)
            .style("fill", "#00ffff");

        function updatePositions() {
            projection.rotate(rotation.current);
            g.selectAll("path").attr("d", path);
            
            nodeElements
                .attr("cx", (d: any) => projection(d.coordinates) ? projection(d.coordinates)[0] : -10)
                .attr("cy", (d: any) => projection(d.coordinates) ? projection(d.coordinates)[1] : -10)
                .style("display", (d: any) => {
                    const visible = d3.geoDistance(d.coordinates, [-rotation.current[0], -rotation.current[1]]) <= Math.PI / 2;
                    return visible ? "block" : "none";
                });
            
            linkPaths
              .attr("d", (d: any) => {
                  const sourceNode = nodes.find(n => n.id === d.source);
                  const targetNode = nodes.find(n => n.id === d.target);
                  if (!sourceNode || !targetNode) return null;
                  const sourceCoords = sourceNode.coordinates;
                  const targetCoords = targetNode.coordinates;
                  const sourceVisible = d3.geoDistance(sourceCoords, [-rotation.current[0], -rotation.current[1]]) <= Math.PI / 2;
                  const targetVisible = d3.geoDistance(targetCoords, [-rotation.current[0], -rotation.current[1]]) <= Math.PI / 2;
                  
                  if (sourceVisible && targetVisible) {
                      return path({type: "LineString", coordinates: [sourceCoords, targetCoords]});
                  }
                  return null;
              })
              .style("stroke-dasharray", "4 4")
              .each(function() {
                  const path = d3.select(this);
                  const length = path.node().getTotalLength();
                  path.style("stroke-dashoffset", -length);
                  path.transition()
                      .duration(2000)
                      .ease(d3.easeLinear)
                      .style("stroke-dashoffset", length)
                      .on("end", function() { d3.select(this).style("stroke-dashoffset", -length).transition().duration(2000).style("stroke-dashoffset", length); }); // loop
              });
        }
        
        d3.timer((elapsed) => {
            rotation.current = [elapsed / 150, -15];
            updatePositions();
        });

        const drag = d3.drag()
          .on("start", (event: any) => {})
          .on("drag", (event: any) => {
            const r = projection.rotate();
            projection.rotate([r[0] + event.dx / 2, r[1] - event.dy / 2]);
            rotation.current = projection.rotate();
            updatePositions();
          });
        svg.call(drag);
        
        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            svg.attr("width", newWidth).attr("height", newHeight);
            projection.scale(Math.min(newWidth, newHeight) / 2.2).translate([newWidth / 2, newHeight / 2]);
            g.select("circle").attr("r", projection.scale()).attr("cx", newWidth/2).attr("cy", newHeight/2);
            updatePositions();
        };

        window.addEventListener('resize', handleResize);
        
        updatePositions();

        return () => window.removeEventListener('resize', handleResize);

    }, [isInitialized, worldData, nodes, links]);

    return (
        <div className="absolute top-0 left-0 w-full h-full">
            <svg ref={svgRef}></svg>
        </div>
    );
};
