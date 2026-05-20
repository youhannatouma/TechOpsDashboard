namespace TechOpsDashboard.Models
{
    public class TechMetric
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public double CpuUsage { get; set; }           
        public double MemoryUsage { get; set; }        
        public double ApiResponseTime { get; set; }    

        public double DiskUsage { get; set; }        
        public double DiskReadBytes { get; set; }      
        public double DiskWriteBytes { get; set; }     

        public double NetworkInBytes { get; set; }     
        public double NetworkOutBytes { get; set; }   

        public int ActiveRequests { get; set; }       
        public int RequestsPerSecond { get; set; }     
        public double ErrorRate { get; set; }          

        public int ProcessCount { get; set; }          
        public int ThreadCount { get; set; }          
    }
}