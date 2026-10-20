import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {
  faXmark,
  faClipboard,
  faArrowsToCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { TrailData } from "./TrailMap.web";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  ScrollView,
  TextInput,
  Image,
  ImageSourcePropType,
} from "react-native";
import SaxonCreekTrail from "../assets/saxon-creek-trail.png";
import TahoeRimTrail from "../assets/tahoe-rim-trail.jpeg";
import HawleyGradeTrail from "../assets/hawley-grade-trail.jpeg";
import SaxonConnector from "../assets/saxon-connector.jpeg";

const trailImages: Record<string, ImageSourcePropType> = {
  "Saxon Creek Trail": SaxonCreekTrail,
  "Tahoe Rim Trail": TahoeRimTrail,
  "Hawley Grade National Recreation Trail": HawleyGradeTrail,
  "Saxon Connector": SaxonConnector,
  "Pacific Crest Trail": {
    uri: "https://cdn.outsideonline.com/wp-content/uploads/2020/09/22/naches-peak-loop-trail-lead_h.jpg?auto=webp&width=3840&quality=75&fit=cover",
  },
};

const trailDescriptions: Record<string, string> = {
  "Saxon Creek Trail":
    "Saxon Creek Trail (a.k.a Mr. Toads Wild Ride) is a popular trail in Tahoe. Many professional mountain bikers ride down hill (south to north) and enjoy many tricky obstacles and curves.",
  "Hawley Grade National Recreation Trail":
    "Hawley Grade National Recreation Trail offers a nice hike up to Echo Summit. On the way, you can enjoy a nice view of the valley, other mountains, and a waterfall.",
};

// Testing only: keep these routes on the map, but leave them out of the sidebar list.
const SIDEBAR_HIDDEN_NAME = /pacific crest|\bpct\b|tahoe rim/i;

function isHiddenFromSidebar(trail: TrailData) {
  return SIDEBAR_HIDDEN_NAME.test(trail.name);
}

function sortTrails(trails: TrailData[]) {
  return [...trails].sort((a, b) => {
    const byName = a.name.localeCompare(b.name, "en", {
      sensitivity: "base",
      numeric: true,
    });
    if (byName !== 0) return byName;
    return a._id.localeCompare(b._id);
  });
}

type propTypes = {
  selectedTrail: TrailData | null;
  displayedTrails: TrailData[] | null;
  handleDeselect: (id: string) => void;
  handleSelect: (id: string) => void;
  center: () => void;
};

function SlideIn(props: propTypes) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!props.displayedTrails) {
    return null;
  }

  const getTime = (trailData: TrailData) => {
    const avgWalkSpeed = 3.5;
    const distanceInKm = trailData.distance / 1000;
    const estimatedTime = distanceInKm / avgWalkSpeed;

    if (estimatedTime < 1) {
      const minutes = Math.round(estimatedTime * 60);
      return `${minutes} minutes`;
    }

    const hours = Math.floor(estimatedTime);
    const minutes = Math.round((estimatedTime - hours) * 60);

    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }

    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minutes`;
  };

  const getDistance = (trailData: TrailData) => {
    const distanceInKm = trailData.distance / 1000;
    return distanceInKm.toFixed(1);
  };

  const filterTrails = (searchTerm: string, trails: TrailData[]) => {
    const term = searchTerm.toLowerCase();
    return sortTrails(
      trails.filter(
        (trail) =>
          !isHiddenFromSidebar(trail) &&
          trail.name.toLowerCase().includes(term),
      ),
    );
  };

  if (props.selectedTrail) {
    return (
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => {
              if (props.selectedTrail?._id) {
                props.handleDeselect(props.selectedTrail._id);
              }
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </Pressable>
          <Pressable onPress={props.center}>
            <FontAwesomeIcon icon={faArrowsToCircle} />
          </Pressable>
          <Pressable
            onPress={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
          >
            <FontAwesomeIcon icon={faClipboard} />
          </Pressable>
        </View>
        <Text style={styles.title}>{props.selectedTrail.name}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.fact}>
            <Text style={styles.factLabel}>Distance: </Text>
            {getDistance(props.selectedTrail)} km
          </Text>
          <Text style={styles.fact}>
            <Text style={styles.factLabel}>Est. Time: </Text>
            {getTime(props.selectedTrail)}
          </Text>
        </View>
        <Text style={styles.descriptionText}>
          {trailDescriptions[props.selectedTrail.name] ?? "no description"}
        </Text>
        <Image
          style={styles.image}
          source={
            trailImages[props.selectedTrail.name] ?? {
              uri: "https://fastly.picsum.photos/id/308/600/400.jpg?hmac=7OkFoJc-gMzMAs3LRlECDU18iS2aLizfB0AzcRNpl1A",
            }
          }
        />
      </View>
    );
  }

  const visibleTrails = filterTrails(searchTerm, props.displayedTrails);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trails</Text>
      <TextInput
        placeholder="Search"
        style={styles.searchBar}
        value={searchTerm}
        onChangeText={setSearchTerm}
      ></TextInput>
      {visibleTrails.length === 0 && <Text>No trails found</Text>}
      <ScrollView showsVerticalScrollIndicator={false}>
        {visibleTrails.map((trail) => (
          <Pressable
            key={trail._id}
            style={styles.shownTrailContainer}
            onPress={() => {
              props.handleSelect(trail._id);
            }}
          >
            <Text>{trail.name}</Text>
            <Image
              style={styles.image}
              source={
                trailImages[trail.name] ?? {
                  uri: "https://fastly.picsum.photos/id/308/600/400.jpg?hmac=7OkFoJc-gMzMAs3LRlECDU18iS2aLizfB0AzcRNpl1A",
                }
              }
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: 370,
    zIndex: 1000,
    backgroundColor: "white",
    padding: 24,
    boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.15)",
    // overflowY: "auto",
  },
  shownTrailContainer: {
    borderColor: "lightgrey",
    padding: 8,
    borderWidth: 1,
    borderRadius: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  statsRow: {
    marginTop: 12,
    marginBottom: 16,
    gap: 6,
  },
  fact: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
  },
  factLabel: {
    fontWeight: "700",
    color: "#222",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  searchBar: {
    height: 40,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 16,
  },
  thumbnailImage: {
    width: "100%",
    height: 150,
    borderRadius: 4,
    marginTop: 8,
  },
});

export default SlideIn;
